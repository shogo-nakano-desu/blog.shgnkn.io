set -eu

SSHPATH="$HOME/.ssh"
if [ ! -d "$SSHPATH" ]; then
  mkdir -p "$SSHPATH"
fi
echo "$secret_key" > "$SSHPATH/key"
chmod 600 "$SSHPATH/key"
rsync -azr --delete -e 'ssh -i $SSHPATH/key -p $server_port' ./public/ $user_name@$server_port:$server_destination