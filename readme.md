TiBuild
====================

Building titanium application based on prior configration and then upload to TestFlight or run TiShadow.

Install
--------------------

    $ git clone git://github.com/umi-uyura/TiBuild.git
    $ npm install ./TiBuild -g

Provisioning
--------------------

1. Copy `tibuild.json` to your project root directory.
2. Edit `tibuild.json`.

Usage
--------------------

Basic usage:

    $ tibuild [<titanium_cli_option>] [options]

### options

+ `--flight` :  
  upload to TestFlight

+ `--shadow` :  
  run TiShadow *(not implemented yet!!!)*

Example
--------------------

#### iOS build and run on simulator

    // tibuild.json
    {
      ...
      "ios": {
        "simulator": "tall"    // "" or "retina" or "tall"
      }
      ...
    }

    $ tibuild -p ios

mean:

    $ ti build -p ios --retina --tall

#### iOS build and install device

    // tibuild.json
    {
      ...
      "ios": {
        "developer": {
          "pp_uuid": "DEVELOP_PROVISIONING_PROFILE_UUID",
          "name": "DEVELOPER NAME"
        },
      }
      ...
    }

    $ tibuild -p ios -T device

mean:

    $ ti build -p ios -T device -D "DEVELOPER NAME" -P "DEVELOP_PROVISIONING_PROFILE_UUID"

#### iOS build and upload to TestFlight

    // tibuild.json
    {
      ...
      "ios": {
        "developer": {
          "pp_uuid": "DEVELOP_PROVISIONING_PROFILE_UUID",
          "name": "DEVELOPER NAME"
        },
      }
      ...
      "testflight": {
        "appname": "APPNAME",
        "api_token": "API_TOKEN",
        "team_token": "TEAM_TOKEN",
        "distribution_lists": "DISTRIBUTION_LIST",
        "notify": true,
        "replace": true
      },
      ...
    }

    $ tibuild -p ios -T device --flight "release notes"

mean:

    $ ti build -p ios -T device -D "DEVELOPER NAME" -P "DEVELOP_PROVISIONING_PROFILE_UUID"
    $ curl http://testflightapp.com/api/builds.json -F file@=<build_path>/APPNAME.ipa -F api_token=API_TOKEN ...

#### iOS distribution

    // tibuild.json
    {
      ...
      "ios": {
        "distribution": {
          "pp_uuid": "DISTRIBUTION_PROVISIONING_PROFILE_UUID",
          "name": "DISTRIBUTION NAME"
        },
      }
      ...
    }

    $ tibuild -p ios -T dist-appstore

mean:

    $ ti build -p ios -T dist-appstore -R "DISTRIBUTION NAME" -P "DISTRIBUTION_PROVISIONING_PROFILE_UUID"

#### Android build and run on emulator

    // tibuild.json
    {
      ...
      "android": {
        "options": {
          "force": true
        }
        "avd" {
          "id": "10",
          "skin": "HVGA",
          "abi": ""
        }
      }
      ...
    }

    $ tibuild -p android

mean:

    $ ti build -p android -I 10 -S HVGA --force


#### Android build and install device

    // tibuild.json
    {
      ...
      "android": {
        "options": {
          "force": true
        }
      }
      ...
    }

    $ tibuild -p android -T device

mean:

    $ ti build -p android -T device --force

#### Android build and upload to TestFlight

    // tibuild.json
    {
      ...
      "android": {
        "options": {
          "force": true
        }
      }
      ...
      "testflight": {
        "appname": "APPNAME",
        "api_token": "API_TOKEN",
        "team_token": "TEAM_TOKEN",
        "distribution_lists": "DISTRIBUTION_LIST",
        "notify": true,
        "replace": true
      },
      ...
    }

    $ tibuild -p android -T device --flight "release notes"

mean:

    $ ti build -p android -T device --force
    $ curl http://testflightapp.com/api/builds.json -F file@=<build_path>/APPNAME.ipa -F api_token=API_TOKEN ...

#### Android distribution

    // tibuild.json
    {
      ...
      "android": {
        "options": {
          "force": true
        },
        "distribution": {
          "keystore": "DISTRIBUTION_KEYSTORE",
          "alias": "DISTRIBUTION_ALIAS",
          "password": "DISTRIBUTION_PASSWORD",
          "output_dir": "DISTRIBUTION_OUTPUT_DIR"
        },
      }
      ...
    }

    $ tibuild -p android -T dist-playstore

mean: 

    $ ti build -p android -T dist-playstore -K "DISTRIBUTION_KEYSTORE" -L "DISTRIBUTIONALIAS" -P "DISTRIBUTION_PASSWORD" -O "DISTRIBUTION_OUTPUT_DIR"

License
--------------------
Licensed under the [MIT license][MIT].  

[MIT]: http://www.opensource.org/licenses/mit-license.php
