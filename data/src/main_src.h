## page( PageEdit, KioskHiTecEditMain)

goProjectGrid.onClick() {
	fc=getParentFunc(this,'addMainPage');
	if( fc ) fc();
	
	code=Cf[projectCode];
	dataPath="project/$code/data";
	fc=getParentFunc(this,'addMainPage');
	if( fc ) fc();
	file=Class.file();
	file.copy("$dataPath/pages.db", "$dataPath/watcher_pages.db", true );
	file.copy("$dataPath/config.db", "$dataPath/watcher_config.db", true );
	print("xxxxxxxxx $dataPath/pages.db xxxxxxxxxxx");	
}


