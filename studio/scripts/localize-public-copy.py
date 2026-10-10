"""Draft translations of public UI/math copy; native Spanish reading is authored separately.
No account, learner, billing, or credential data is submitted.
"""
import json, re, time, urllib.parse, urllib.request, concurrent.futures
from pathlib import Path
root=Path(__file__).resolve().parents[1]
rows=[]
for group in ['ui','data']:
    rows += json.loads((root/'design/localization'/f'{group}-source.json').read_text(encoding='utf-8'))
dest=root/'src/translations.json'
result=json.loads(dest.read_text(encoding='utf-8'))
keys=list(dict.fromkeys(r['text'] for r in rows if len(r['text'])>1 and r['text'] not in result))
chunks=[]; chunk=[]; size=0
for key in keys:
    if size+len(key)>3200 or len(chunk)>=40:
        chunks.append(chunk);chunk=[];size=0
    chunk.append(key);size+=len(key)+1
if chunk:chunks.append(chunk)
def translate(batch):
    safe=[re.sub(r'\$\{(\d+)\}',lambda m:'ZXQ'+m[1]+'QXZ',s) for s in batch]
    url='https://translate.googleapis.com/translate_a/single?'+urllib.parse.urlencode({'client':'gtx','sl':'en','tl':'es','dt':'t','q':'\n'.join(safe)})
    for attempt in range(4):
        try:
            data=json.load(urllib.request.urlopen(url,timeout=40))
            values=''.join(a[0] or '' for a in data[0]).strip().split('\n')
            if len(values)!=len(batch):
                if len(batch)==1:raise ValueError('Line boundaries changed')
                mid=len(batch)//2
                return translate(batch[:mid])|translate(batch[mid:])
            translated={}
            for source,value in zip(batch,values):
                value=re.sub(r'ZXQ\s*(\d+)\s*QXZ',lambda m:'${'+m[1]+'}',value.strip(),flags=re.I)
                if sorted(re.findall(r'\$\{\d+\}',source))!=sorted(re.findall(r'\$\{\d+\}',value)):raise ValueError('Changed placeholders')
                translated[source]=value.replace('Mundo de los niños genios','Kid Genius World').replace('Mundo de genios infantiles','Kid Genius World')
            return translated
        except Exception:
            if attempt==3:raise
            time.sleep(1+attempt)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    for index,values in enumerate(pool.map(translate,chunks)):
        result.update(values)
        dest.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        print(f'Public-copy batches {index+1}/{len(chunks)}; entries {len(result)}',flush=True)
