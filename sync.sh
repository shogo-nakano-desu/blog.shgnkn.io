#!/bin/sh
set -eu

if [ ! -d "$HOME/.ssh" ]; then
  mkdir -p "$HOME/.ssh"
fi
echo "$secret_key" > "$HOME/.ssh/key"
chmod 600 "$HOME/.ssh/key"
sh -c "rsync -azr --delete -e 'ssh -i $HOME/.ssh/key -p $server_port' ./public/ $user_name@$server_ip:$server_destination"
rm -rf $HOME/.ssh