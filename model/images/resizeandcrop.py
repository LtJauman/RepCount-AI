import os
import subprocess

# Function to resize and crop all images in a directory
def resize_images(directory):
    # Loop through all files in the directory
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        # Check if the file is a PNG image
        if filename.endswith('.png'):
            # Define the new filename for the resized image
            resized_filename = os.path.splitext(filename)[0] + '_resized.png'
            resized_filepath = os.path.join(directory, resized_filename)
            # Execute FFmpeg command to resize the image and save it with the new filename
            subprocess.call(['ffmpeg', '-i', filepath, '-vf', f'scale=244:-1', resized_filepath])
            # Delete the original image
            os.remove(filepath)
            # Execute FFmpeg command to crop the resized image and save it with the original filename
            subprocess.call(['ffmpeg', '-i', resized_filepath, '-filter:v', f'crop=in_w:244', filepath])
            # Delete the resized image
            os.remove(resized_filepath)
        # Check if the file is a directory
        elif os.path.isdir(filepath):
            # If it's a directory, call the function recursively to resize images in that directory
            resize_images(filepath)

# Call the function to resize and crop images in the current directory and its subdirectories
resize_images('C:\\Users\\User\\Documents\\GitHub\\RepCount-AI\\model\\images')
