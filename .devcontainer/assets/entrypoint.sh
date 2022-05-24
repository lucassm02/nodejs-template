#!/bin/zsh

# install oh-my-zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
#install spaceship theme
git clone https://github.com/denysdovhan/spaceship-prompt.git "/home/node/.oh-my-zsh/custom/themes/spaceship-prompt"
ln -s "/home/node/.oh-my-zsh/custom/themes/spaceship-prompt/spaceship.zsh-theme" "/home/node/.oh-my-zsh/custom/themes/spaceship.zsh-theme"
#install plugins
sh -c "$(curl -fsSL https://raw.githubusercontent.com/zdharma-continuum/zinit/master/doc/install.sh)"
