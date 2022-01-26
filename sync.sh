#!/bin/sh
set -eu

KEYPATH="$HOME/.ssh"
if [ ! -d "$KEYPATH" ]; then
  mkdir -p "$KEYPATH"
fi
echo "$secret_key" > "$KEYPATH/key"
chmod 600 "$KEYPATH/key"
sh -c "rsync -vv -azr --delete -e 'ssh -i $KEYPATH/key -o StrictHostKeyChecking=no -p $server_port' ./public/ $user_name@$server_ip:$server_destination"
rm -rf $HOME/.ssh