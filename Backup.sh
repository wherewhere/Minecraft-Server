#!/bin/bash

datatime=$(date '+%X %Z %x')
git commit -a -m "Backup ${datatime}"
