cd frontend
git clone https://github.com/flutter/flutter.git -b stable
./flutter/bin/flutter doctor

echo $SECRETS_JSON > secrets.json
