# studio-extensions

Instruction guide how to create an instrument extension (IEXT) is available [here](http://www.envox.hr/eez/studio/create-an-instrument-extension/introduction.html).

A pull request for adding a new IEXT should modify only `./extensions-list.txt`. The new IEXT could be hosted: 

* locally (i.e. it will become a part of the repository) or 
* remotely as defined with a given URL.
    
All locally hosted IEXT should be placed into `/org/<manufacturer>/<instrument_folder>`. 

_IMPORTANT: Please ensure that your pull request includes IEXT's .zip file with version suffix that is higher than the latest listed in the IEXT catalog (i.e. this repository). Do not increase the .zip version suffix manually, define it in the project file that the Build procedure can add it automatically (see [Extension definitions](https://www.envox.hr/eez/studio/create-an-instrument-extension/project-items/extension-definitions.html))._

The pull request has to be approved by the EEZ team, and only files into the newly added folder will be checked. The IEXT is also subject to a comprehensive inspection to ensure that it does not contain malicious code.

