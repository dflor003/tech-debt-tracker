#!/bin/bash

function installPackage() {
	local packageName=$1
	
	echo "Installing package: ${packageName}"
	
	# Check if package is already installed
	npm list -g $packageName &>/dev/null
	
	# Install if not already installed
	if [ "$?" -ne "0" ]; then
		npm install -g $packageName
	
		if [ "$?" -ne "0" ]; then
			echo "Error installing package: '${packageName}'"
			exit 1
		fi
		
		echo "Installed '${packageName}'!"
	else
		# Otherwise don't
		echo "Package '${packageName}' already installed."
	fi
	
	echo
}

function beginSection() {
	echo $1
	echo "-----------------------------------------"
	echo
}

beginSection "Installing project global dependencies..."
installPackage "less"
installPackage "typescript"
installPackage "tsd@next"
installPackage "karma-cli"
installPackage "jake"
installPackage "bower"

beginSection "Fetching TypeScript Library Definitions..."
tsd reinstall

beginSection "Installing Bower depenendencies..."
bower install

beginSection "Compiling Jake Scripts..."
tsc --target ES5 --module CommonJS JakeFile.ts