SET mypath=%~dp0
SET mypath="%mypath:~0,-1%"
CD %mypath%
PROMPT $$(gotsumon).
TITLE Gotsumon

DOSKEY shortcuts=doskey /macros
DOSKEY clr=COLOR 0B
DOSKEY dev_server=npm run dev

COLOR 0B
@CLS
@CD %mypath%
@ECHO shortcuts
@Doskey /macros

