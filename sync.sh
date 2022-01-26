set -eu

if [! -d "$HOME/.ssh"]; then
  mkdir -p "$HOME/.ssh"
fi
echo "$secret_key" > "$HOME/.ssh/key"
chmod 600 "$SSHPATH/key"
rsync -azr --delete -e 'ssh -i $SSHPATH/key -p $server_port' ./public/ $user_name@$server_port:$server_destination
rm -rf $HOME/.ssh