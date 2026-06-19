import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

const readEnvFile = (file) => {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs.readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && line.includes('='))
      .map(line => {
        const index = line.indexOf('=');
        const rawValue = line.slice(index + 1).trim();
        const value = rawValue.replace(/^['"]|['"]$/g, '');
        return [line.slice(0, index).trim(), value];
      })
  );
};

const localEnv = readEnvFile(path.join(root, '.env.local'));
const apiKey = process.env.ELEVENLABS_API_KEY || localEnv.ELEVENLABS_API_KEY;

if (!apiKey) {
  console.error('ELEVENLABS_API_KEY is not configured in the environment or .env.local.');
  process.exitCode = 1;
} else {
  const response = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
    headers: { 'xi-api-key': apiKey },
  });

  const bodyText = await response.text();
  let body = {};
  try {
    body = JSON.parse(bodyText);
  } catch {
    body = { raw: bodyText.slice(0, 220) };
  }

  if (!response.ok) {
    const message = typeof body.detail === 'string'
      ? body.detail
      : body.detail?.message || body.message || 'ElevenLabs rejected the configured key.';
    console.error(JSON.stringify({
      ok: false,
      status: response.status,
      message,
      action: message.includes('user_read')
        ? 'Create or update the ElevenLabs key with user_read permission so credits can be checked before cache warming.'
        : 'Update the local ElevenLabs secret before warming the Firebase-hosted voice cache.',
    }, null, 2));
    process.exitCode = 1;
  } else {
    const characterLimit = Number(body.character_limit || 0);
    const characterCount = Number(body.character_count || 0);
    const remainingCharacters = Math.max(0, characterLimit - characterCount);

    console.log(JSON.stringify({
      ok: true,
      tier: body.tier || null,
      characterLimit,
      characterCount,
      remainingCharacters,
      nextCharacterCountResetUnix: body.next_character_count_reset_unix || null,
    }, null, 2));

    if (remainingCharacters <= 0) {
      console.error('The configured ElevenLabs key has no remaining characters. Update the local ElevenLabs secret before warming the Firebase-hosted voice cache.');
      process.exitCode = 1;
    }
  }
}
