#!/bin/bash
# Подтягивает проект с GitHub (запусти в Терминале)
cd "$(dirname "$0")"
git fetch origin
git checkout main 2>/dev/null || git checkout master
git pull origin main 2>/dev/null || git pull origin master
