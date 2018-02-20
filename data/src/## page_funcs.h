## [ PageEdit, KioskHiTecEditMain]
 

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

## [ Common, searchFunc]

codePageFunc(cur, val) {
	cur[cmsCode]=this.group.value();
	items=db.fetchAll("select pageCode from pageFunc where cmsCode=#{cmsCode} group by pageCode", cur );
	this.code.addItem( items, 'pageCode', '==전체==');
}

## [Page, AutoStart]
layout: <page><canvas id="c"></page>
onInit() {
	this.size(400,350);
	remainTime=15;
	this.timer(1000, callback() {
		if( remainTime.eq(0) ) {
			this.post(1, this);	
			return;
		}
		this[c].redraw();
		@remainTime--;
	});
}
onEvent() {
	while(tm, this.timer() ) {
		this.killTimer(tm);
	}
	System.run('KioskNew.exe');
	Cf.exit();
}
c.onDraw() {
	rc=@draw.rect();
	@draw.font(18);
	@draw.text( rc.center(80,40), "$remainTime 초");
}



[## 페이지 함수 적용 : 2016-11-06 04:23:06 ##]
 
## [ Common, searchFunc ]
save.onClick(cur, val) {
	cur=this.grid.current();
	switch( cur[kind] ) {
	case a:
	case b:
	case c:
	}
	this.alert("save button $cur");
 }
 

 node=getCommCodeNode('kiosk#reqType');