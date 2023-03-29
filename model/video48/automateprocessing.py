import os

# Replace the path below with the path to the directory containing all the folders
root_dir = "C:\\Users\\User\\Videos\\Captures\\Pull_ups\\48"

# Replace the extension below with the video file extension you want to process
video_ext = ".mp4"

# Replace the command below with your desired ffmpeg command
ffmpeg_cmd = "ffmpeg -i {} -r 5 putput_%04d.png"
print("Running")
# Traverse through all subdirectories and find video files
for subdir, dirs, files in os.walk(root_dir):
    for file in files:
        print(file)
        # Check if file is a video file
        if file.endswith(video_ext):
            print("Found")
            # Get the full path to the video file
            video_path = os.path.join(subdir, file)
            
            # Navigate to the folder containing the video file
            os.chdir(subdir)
            
            # Run the ffmpeg command to extract frames
            os.system(ffmpeg_cmd.format(video_path))
