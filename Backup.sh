#!/bin/bash

datatime=$(date '+%X %x %Z')
git commit -a -m "Backup ${datatime}"
