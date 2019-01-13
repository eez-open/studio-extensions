# studio-extensions

A pull request for adding a new instrument extension (IEXT) should modify only `./extensions-list.txt`. The new IEXT could be hosted: a) locally (i.e. it will became a part of repostory) or b) remotely as defined with given URL.
All locally hosted IEXT should be placed into `/org/<manufacturer>/<instrument_folder>`. 
During the process of pull request approval, only files into newly added folder will be checked. The IEXT is also subject for a deep check to ensure that IEXT doesn't contain malicious code.
