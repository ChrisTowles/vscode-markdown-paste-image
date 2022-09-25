

#!/bin/sh

echo "imagePath = $1"

# require xclip(see http://stackoverflow.com/questions/592620/check-if-a-program-exists-from-a-bash-script/677212#677212)
command -v xclip >/dev/null 2>&1 || { echo >&1 "error: no xclip found"; exit 1; }

# write image in clipboard to file (see http://unix.stackexchange.com/questions/145131/copy-image-from-clipboard-to-file)
if ( xclip -selection clipboard -target image/png -o > /dev/null 2>&1) then
    # image in clipboard, let's save it
    xclip -selection clipboard -target image/png -o > $1 2>/dev/null
    echo "image writen to: $1"
else
    echo "warning: no image in clipboard"
    exit 1;
fi