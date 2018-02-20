s=Class.file().readAll('data/src/menu.class');
a=util_classFuncSave('common', 'menu', s.ref() );


print("a=$a");


page=Cf.widget({
	layout: 
		<page margin=0 spacing=0>
			<hbox margin=0>
				<canvas id=top height=45>
			</hbox>
			<div id="content" stretch=1>
			<hbox margin=0 spacing=0>
				<canvas id="status" height=24 expand=true><canvas id="info" width=420 height=24>
			</hbox>
		</page>
	tag: main,
	title: 경기도체육회 종합대회운영,
	icon:  vicon.application_lightning,
	onInit() {
		include('common.menu', true);
		menu=newClass('common.menu', Class.db('knpc_server'), this);
	}
});
page.open();

