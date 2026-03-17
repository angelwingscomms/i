import sys, os, shutil
f1, f2 = sys.argv[1], sys.argv[2]
s1 = {f for r,d,fs in os.walk(f1) for f in fs}
os.makedirs(d:=os.path.join(f2,'not-in'), exist_ok=True)
[shutil.move(os.path.join(f2,f), os.path.join(d,f)) for f in os.listdir(f2) if os.path.isfile(os.path.join(f2,f)) and f not in s1]