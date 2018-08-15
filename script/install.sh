#! /bin/bash
# build tools
sudo apt-get update
sudo apt-get --assume-yes upgrade
sudo apt-get --assume-yes install build-essential

# drivers
# note: cuda - 9.2
wget http://us.download.nvidia.com/tesla/396.44/nvidia-diag-driver-local-repo-ubuntu1604-396.44_1.0-1_amd64.deb
dpkg -i nvidia-diag-driver-local-repo-ubuntu1604-396.44_1.0-1_amd64.deb
sudo apt-get update
sudo apt-get -y install cuda-drivers
sudo apt-get update && sudo apt-get -y upgrade

# cuda 9.2 installation
wget http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1604/x86_64/cuda-repo-ubuntu1604_9.2.148-1_amd64.deb
sudo dpkg -i cuda-repo-ubuntu1604_9.2.148-1_amd64.deb
sudo apt-key adv --fetch-keys http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1604/x86_64/7fa2af80.pub
sudo apt-get update
sudo apt-get -y install cuda

# cuDNN install
wget https://transfer.sh/ecIrC/libcudnn7.deb
sudo dpkg -i libcudnn7.deb

# python3 misc
sudo apt-get install unzip
sudo apt-get --assume-yes install python3-tk
sudo apt-get --assume-yes install python3-pip
sudo apt-get --assume-yes install python3-dev
sudo pip3 install --upgrade pip
sudo pip3 install numpy scipy matplotlib pandas sklearn jupyter

# install pytorch
sudo pip3 install http://download.pytorch.org/whl/cu92/torch-0.4.1-cp36-cp36m-linux_x86_64.whl
suod pip3 install torchvision

# install tensorflow
sudo pip3 install tensorflow-gpu

echo "Reboot required."
sudo reboot
