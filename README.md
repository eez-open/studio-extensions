# studio-extensions

Instruction guide how to create an instrument extension (IEXT) is available [here](http://www.envox.hr/eez/studio/create-an-instrument-extension/introduction.html).

A pull request for adding a new IEXT should modify only `./extensions-list.txt`. The new IEXT could be hosted: 

* locally (i.e. it will became a part of repository) or 
* remotely as defined with given URL.
    
All locally hosted IEXT should be placed into `/org/<manufacturer>/<instrument_folder>`. 

_IMPORTANT: Please insure that your pull request include IEXT's .zip file with version suffix that is higher then the latest listed in IEXT catalog (i.e. this repository). Do not increase .zip version suffix manually, define it in project file that Build procedure can add it automatically (see [Extension definitions](https://www.envox.hr/eez/studio/create-an-instrument-extension/project-items/extension-definitions.html))._

The pull request has to be approved by EEZ team, and only files into newly added folder will be checked. The IEXT is also subject for a comprehensive inspection to ensure that it does not contain malicious code.

