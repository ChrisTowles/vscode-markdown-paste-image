

#!/bin/sh

# Exit on any error
set -e

echo "imagePath = $1"

# require wl-paste (Wayland clipboard tool)
if ! command -v wl-paste >/dev/null 2>&1; then
    echo >&2 "error: no wl-paste found"
    exit 1
fi

# Validate input parameter
if [ -z "$1" ]; then
    echo >&2 "error: no image path provided"
    exit 1
fi

# create a temporary file to check the image type first
temp_file=$(mktemp) || {
    echo >&2 "error: failed to create temporary file"
    exit 1
}

# Ensure cleanup on exit
trap 'rm -f "$temp_file"' EXIT

# Try to paste image data from clipboard
image_pasted=false

# Get available types and try image types that are actually available
available_types=$(wl-paste --list-types 2>/dev/null)

# Try common image MIME types in order of likelihood, but only if they're available
for mime_type in "image/png" "image/jpeg" "image/jpg" "image/gif" "image/bmp" "image/webp" "image/tiff"; do
    if echo "$available_types" | grep -q "^$mime_type$"; then
        if wl-paste --type "$mime_type" > "$temp_file" 2>/dev/null; then
            # Check if we actually got data and it's an image
            if [ -s "$temp_file" ] && file "$temp_file" 2>/dev/null | grep -q "image"; then
                image_pasted=true
                echo "pasted image with MIME type: $mime_type"
                break
            fi
        fi
    fi
done

# If no image data found, try text (might be a file path)
if [ "$image_pasted" = false ]; then
    if wl-paste --type "text/plain" > "$temp_file" 2>/dev/null && [ -s "$temp_file" ]; then
        # Check if the clipboard content is a file path to an image
        first_line=$(head -n1 "$temp_file" 2>/dev/null | tr -d '\n\r')
        if [ -f "$first_line" ]; then
            # Check if it's an image file
            if file "$first_line" 2>/dev/null | grep -q "image"; then
                # It's a file path to an image, copy the actual image file
                if cp "$first_line" "$temp_file" 2>/dev/null; then
                    echo "detected file path in clipboard, copying image: $first_line"
                    image_pasted=true
                else
                    echo "warning: failed to copy image file from clipboard path"
                    exit 1
                fi
            fi
        fi
    fi
fi

if [ "$image_pasted" = false ]; then
    echo "warning: no image in clipboard"
    exit 1
fi

# verify the file was created and has content
if [ ! -s "$temp_file" ]; then
    echo "warning: no image in clipboard"
    exit 1
fi

# detect the actual image type
file_output=$(file "$temp_file" 2>/dev/null) || {
    echo >&2 "error: failed to detect file type"
    exit 1
}

# Determine extension based on file type
extension=""
case "$file_output" in
    *"PNG image"*)
        extension=".png"
        ;;
    *"JPEG image"*|*"JPG image"*)
        extension=".jpg"
        ;;
    *"GIF image"*)
        extension=".gif"
        ;;
    *"BMP image"*)
        extension=".bmp"
        ;;
    *"WebP image"*)
        extension=".webp"
        ;;
    *"TIFF image"*|*"TIF image"*)
        extension=".tiff"
        ;;
    *"image"*)
        # generic image type, default to png
        extension=".png"
        ;;
    *)
        echo "warning: no image in clipboard"
        exit 1
        ;;
esac

# remove existing extension from target path and add correct one
base_path="${1%.*}"
final_path="${base_path}${extension}"

# move the temporary file to the final destination with correct extension
if mv "$temp_file" "$final_path" 2>/dev/null; then
    echo "image writen to: $final_path"
    echo "detected type: $extension"
else
    echo >&2 "error: failed to save image to $final_path"
    exit 1
fi
