#!/usr/bin/env bash
clear
echo "Type your commit: "
read msg;
git add .
git commit -m "$msg";
git push origin master;
