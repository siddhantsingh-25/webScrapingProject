@echo off
setlocal
set NODE_PATH=C:\Program Files\nodejs
set PATH=%NODE_PATH%;%PATH%
cd E:\GitHub\TrotPedigreeNodejs
node.exe ./trotPedigree.js >> ./logs.txt
