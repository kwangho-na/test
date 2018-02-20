##
PageBase(page, canvas) {
	this.addClass( 'common.Config' );
	_log=func(msg, alert) {
		tm=System.localtime();
		print("log>> $msg");
	};
}

findControl(tagName,root) {
	return this.findTag(tagName, root).get('@control');
}

findTag(tagName, root) {
	if( tagName.find('#') ) {
		root=xmlNode.child(0);
		if( tagName.ch().eq('#') ) {
			return findTag(tagName.value(1), root);
		}
		tagName.split('#').inject(tag, id);
		return findTagId(tag, id, root);
	}
	if( root ) {
		if( typeof(root,'bool') ) {
			root=xmlNode;
		}
	} else {
		root=when(tag, tag, xmlNode);
	}
	return findTag(tagName, root);
}

getControl(cur, cid) {
	ctrl=cur[@control];
	if( ctrl ) return ctrl;
	not( cid ) {
		cid=cur.tag;
		not( cid ) return;
	}
	if( cur[ClassPath] ) {
		classId="$cur[ClassPath]/control.$cid";
	} else {
		cf.inject(projectId, pageCode);
		classId="${projectId}/${pageCode}/control.$cid";
	}
	classErrorCheck=_node(cf, 'classErrorCheck');
	if( classErrorCheck[$classId] ) return null;
	include(classId);
	ctrl=newClass(classId, cur, this );
	not( ctrl ) {
		classErrorCheck[$classId]=true;
		_log("[error.getControl] $classId 컨트롤 로딩 실패\n cotrolNode: $cur");
		return null;
	}
	cur[@control]=ctrl;
	return ctrl;
}

mainControl() {
	p=this;
	while( p ) {
		pp=p.parentCtrl;
		not( pp ) return p;
		p=pp;
	}
	return null;
}

confLayout(tag) {
	setNodeSize(tag); 
	while( cur, tag ) {
		this.getControl(cur).conf();
	}
}

drawControl(draw, tag, timeline) {
	drawNodeStyle(draw, tag);
	while( cur, tag ) {
		this.getControl(cur).draw(draw, timeline);
	}
}

mouseDownControl(root, pos) {
	while( cur, root ) { 
		not( cur[rect].contains(pos) ) continue;
		this.getControl(cur).mouseDown(pos);
	}
}

mouseUpControl(root, pos) {
	while( cur, root ) { 
		not( cur[rect].contains(pos) ) continue;
		this.getControl(cur).mouseUp(pos);
	}
}

rate(x) {
	not( x ) return null;
	x*=cf.pageRate;
	return x;
}

update() {
	not( canvas ) {
		p=this.mainControl();
		p.inject(canvas);
	}
	canvas.redraw();
}
 


##

CanvasBase() {
	this.addClass('common/control.PageBase'); 	
	page=null, canvas=null;
	timelineNode={};
}

loadMainPage(pageXml) {
	cf.inject(imagePath, projectId, pageCode);
	root= this.parseXml( fmt(pageXml) );
	if( root[Template] ) {
		tmp=root[Template].ref();
		while( tmp.valid() ) {
			var=tmp.findPos(';').trim();
			xml=fmt( conf(var) );
			this.parseXml(xml.ref(), root);
		}
	}
	this.mainNode=root;
	this.pageStart();
	this.update();
}

/*    페이지 비율 설정    */
setPageRate(rate) {
	not( rate) return;
	not( typeof(rate,'number') ) {
		rate=rate.toNumber();
	}
	if( rate ) cf.pageRate=rate;
	this.conf();
	this.update();
}

conf() {
	main=this[mainNode];
	setNodeSize(main, true);
	confNodeLayout(main);
	while( cur, main ) {
		this.getControl(cur).conf();
	}
}

draw(draw,  timeline) {
	not( cf.pageStart ) return;
	node=this[mainNode];
	if( cf[pageMode].eq('full') ) {
		rc=page.rect();
		not( rc.eq(cf[pageRect]) ) {
			cf[pageRect]=rc;
			node[Width] 		= rc.width();
			node[Height] 		= rc.height();
			node[rect]			= rc;
			canvas.size(rc);
			tagClearRect(node);
			this.conf();
			this.update();
		}
	}
	if( node[bg] ) {
		draw.drawImage(node[rect], imageLoad(node, "bg"), 'fill');
	}
	while( cur, node ) {
		if( cur[tag].eq('Popup') ) continue;
		this.getControl(cur).draw(draw, timeline);
	}
}

mouseDown(pos) {
	while( cur, this[mainNode] ) {
		if( cur[GlobalMouseUse] ) {
			this.getControl(cur).mouseDown(pos);
			continue;
		}
		not( cur[rect].contains(pos) ) continue;
		if( cf[popupControl] ) {
			not( cur[tag].eq('Popup') ) continue;
		}
		this.getControl(cur).mouseDown(pos);
	}
}

mouseUp(pos) {
	while( cur, this[mainNode] ) {
		if( cur[GlobalMouseUse] ) {
			this.getControl(cur).mouseUp(pos);
			continue;
		}
		not( cur[rect].contains(pos) ) continue;
		if( cf[popupControl] ) {
			not( cur[tag].eq('Popup') ) continue;
		}
		this.getControl(cur).mouseUp(pos);
	}
}

mouseMove(pos) {
	while( cur, this[mainNode] ) {
		if( cur[GlobalMouseUse] ) {
			this.getControl(cur).mouseMove(pos);
			continue;
		}
		not( cur[rect].contains(pos) ) continue;
		if( cf[popupControl] ) {
			not( cur[tag].eq('Popup') ) continue;
		}
		this.getControl(cur).mouseMove(pos);
	}
}

/*    타입라인(애니메이션) 시작    */
timelineStart(tid, target, style) {
	tm=timelineNode.findOne('tid',tid);
	not( tm ) {
		_log("$tid 타임라인을 찾을수 없습니다");
		return;
	}
	tm.inject(duration, range, mode);
	tm.state(NODE.start, true);
	tm[target]=target;
	tm[command]=target.command;
	tm[timelineStyle]=style;
	cf[currentTimeline]=tm;
	Cf.timeLine("${tid}.start", canvas, duration, range, mode);
}

/*     전체 타입라인(애니메이션) 종료     */
timelineStop() {
	while( tm, timelineNode ) {
		key=tm[tid];
		if( Cf.timeLine("${key}.running") ) {
			Cf.timeLine("${key}.stop");
			tm.state(NODE.start, false);
		}
	}
	cf[currentTimeline]=null;
}

addCanvasEvent(type, node) {
	canvas.postEvent(type, node);
}

getWidget(pageId) {
	node=_node(cf,'widgetNode');
	return node[$pageId];
}

showWidget(pageId, rect, top) {
	node=_node(cf,'widgetNode');
	widget=node[$pageId];
	not( widget ) {
		print("CanvasBase::showWidget page id=======> $pageId $rect");
		widget=pageLoad(pageId, true); /* canvas.widget( getPageString(null,pageId), true ); */
		not( widget ) return;
		widget.flags('splash, top');
		node[$pageId]=widget;
		widget.open();
	}
	rcGlobal=canvas.mapGlobal(rect );
	widget.move(rcGlobal.lt());
	widget.size(rcGlobal.size());
	if( this.currentPageGeo ) {
		this.currentPageGeo=null;
		return;
	}
	not( this.activeEventSet ) {
		this.activeEventSet=true;
		mainPage=getMainPage(page);
		mainPage.eventMap( onActivationChange, this.widgetPageCheck );
		mainPage.eventMap( onMove, this.moveWidget );
	}
	not( widget.is('visible') ) widget.show();
	return widget;
}

hideWidget(pageId) {
	node=cf[widgetNode];
	not( node ) return;
	if( pageId ) {
		widget=node[$pageId];
		if( widget ) widget.hide();
		return true;
	}
	while( key, node.keys(), n, 0 ) {
		widget=node[$key];
		if( widget ) widget.hide();
	}
	return when(n, true, false);
}

drawWidgetPage(draw, rect, pageId, cur, top) {
	widget=this.getWidget(pageId);
	not( cur.childCount() ) {
		if( widget ) cur.addNode(widget);
	}
	ok=cf[submenuNode];
	not( ok ) {
		not( page.isActivate(), widget.isActivate() ) ok=true;
	}
	draw.drawWidget(rect, widget );
	if( ok ) {
		widget.hide();
	} else {
		this.showWidget(pageId, rect, top);
	}
}

widgetPageCheck() {
	mainPage=getMainPage(page);
	
	state=mainPage.state();
	not( state.eq(this.prevPageState) ) {
		switch( state ) {
		case minimized:
			this.hideWidget();
		case active:
			this.update();
		case fullscreen:
			this.update();
		default:
			if( this[prevPageState].eq('maximized') ) {
				this.hideWidget();
			}
		}
		this.prevPageState=state;
	}
	
	geo=mainPage.geo();
	not( geo.eq(this.prevPageGeo) ) {
		this.prevPageGeo=geo;
		this.update();
	}
	
	not( page.is('visible') ) {
		this.hideWidget();
	}
	
	tick=System.tick();
	not( this.prevActivateTick ) {
		this.prevActivateTick=tick;
	}
	
	node=cf[widgetNode], keys=node.keys();
	while( key, keys ) {
		widget=node[$key];
		not( widget ) continue;
		if( widget.is('visible') ) {
			flag=when( mainPage.isActivate(), true, false );
			widget.showTop(flag);
		}
	}
}

moveWidget() {
	mainPage=getMainPage(page);
	geo=mainPage.geo();
	this.currentPageGeo=geo;
	this.prevPageGeo=geo;
	this.update();
}

loadForm(root, code, rc) {
	xml=conf(code);
	xmlNode=this.parseXml( xml,  root.removeAll() );
	inputs=_node(root, 'InputNode');
	inputs.initNode();
	
	_parse=func(s) {
		arr=_arr(row,'cells',true);
		while( s.valid() ) {
			c=s.ch();
			if( c.eq('<') ) {
				sp=s.cur(), s.incr();
				tag=s.move();
				prop=s.findPos('>'), data=null;
				if( tag.eq('blank') ) {
					arr.add("#blank");
				} else {
					inputNode=inputs.addNode();
					this.parseProp(inputNode, tag, prop);
					if( data ) inputNode[data]=data;
					idx=inputNode.index(), key="@{$idx}";
					inputs[$key]=inputNode;
					arr.add(key);
				}
				if( s.ch().eq(',') ) {
					s.incr();
				} else {
					data=s.findPos("</$tag>");
					if( s.ch().eq(',') ) {
						s.incr();
					}
				}
			} else {
				arr.add(s.findPos(",").trim() );
			}
		}
	};
	
	_h=func( r, c ) {
		h=ha.get(r), r+=1;
		while( n,  ha.size(), r ) {
			row=xmlNode.child(r), val=row[cells].get(c);
			not( val.eq('X') ) {
				break;
			}
			h+=ha.get(n);
		}
		return h;
	};
	_w=func(arr, c, size) {
		w=wa.get(c), c++;
		while( n, size, c) {
			not( arr[$n].eq('#') ) break;
			w+=wa.get(n);
		}
		return w;
	};
	
	rc.inject( sx, sy, sw, sh), sx=0, sy=0;
	vr=nvl( xmlNode[vrate], xmlNode.childCount());
	ha=_arr().recalc( min(sh,305), vr );
	wa=_arr().recalc( sw, xmlNode[rate] );
	
	print(wa, ha, sh, sw);
	
	while( row, xmlNode ) {
		_parse( row[data].ref() );
	}
	maxCell=0;
	while( row, xmlNode) {
		size=row[cells].size();
		if( size>maxCell ) maxCell=size;
	}
	while( row, xmlNode) {
		size=row[cells].size();
		if( size<maxCell ) {
			ep=maxCell-size;
			while( n, ep ) row[cells].add('#');
		}
	}
	
	while( h, ha, r, 0 ) {
		row=xmlNode.child(r), arr=row[cells];
		cx=sx, lastCell=0, size=arr.size();
		row[rect]=Class.rect(cx, sy, sw, h);
		while( c, size, 0 ) {
			val=arr[$c];
			if( val.eq('X','#') ) {
				cx+=wa.get(c);
				continue;
			}
			ch=_h(r,c), cw=_w(arr,c, size);
			row[rect $c]=Class.rect(cx, sy, cw, ch);
			if( val.ch().eq('@') ) {
				inputNode=inputs[$val];
				if( inputNode ) {
					inputNode[rect]=row[rect $c];
					print("inputNode == $val, $inputNode, $inputNode[rect] xxx");
				}
			}
			cx+=cw;
			lastCell=c;
		}
		row[lastCell]=lastCell;
		sy+=h;
	}
}

drawCodeForm(draw, cur, node) {
	rcBody=cur[rect body];
	rc=nvl( node[rect form], rcBody.incr(10) );
	rc.inject( sx, sy, sw, sh);
	curCode=nvl( node[depth].eq(2), node, node[currentRow]);
	rc.bottom( rcBody.bottom() );
	not( cur.childCount() ) {
		this.mainControl().loadForm(cur, 'data#form.CommonCode', rc);
	}
	rc.inject(x,y);
	offset=Class.point(x,y), cur[offset]=offset;
	draw.font(12,'normal', '#606060');
	form=findTag('form', cur);
	lastRow=form.childCount()-1;
	while( row, form, r, 0 ) {
		last=row[lastCell];
		while( val, row[cells], c, 0 ) {
			if( val.eq('X','#blank') ) continue;
			rc=row[rect $c].incrXY(offset, true);
			if( c.eq(last) ) {
				draw.rectLine(rc, 4, '#909090');
			} else {
				draw.rectLine(rc, 34, '#909090');
			}
			if( val ) draw.text(rc, val, 'center');
		}
		rc=row[rect].incrXY(offset, true);
		if( r.eq(0) ) {
			draw.rectLine(rc, 2, '#909090', 2);
		} else if( r.eq(lastRow) ) {
			draw.rectLine(rc, 4, '#909090', 2);
		}
	}
}

drawSubPage(draw, widget, rect) {
	ok=cf[submenuNode];
	not( ok ) {
		not( page.isActivate(), widget.isActivate() ) ok=true;
	}
	draw.drawWidget(rect, widget );
	if( ok ) {
		widget.hide();
	} else {
		this.showWidget(widget[pageId], rect, top);
	}
}

/*      타입라인(애니메이션) 추가      */
timelineAdd(tid, duration, range, mode) {
	tm=timelineNode.findOne('tid',tid);
	not( tm ) {
		tm=timelineNode.addNode();
	}
	tm[tid]=tid;
	tm[startTick]=System.tick();
	tm.put(duration, range, mode);
}

## DB연결관리
layout: <page>
		<tree id="grid">
		<hbox>
			<button id="add" text="DB연결추가" icon="vicon.database_add">
			<button id="reload" text="새로고침" icon="vicon.arrow_refresh">
			<space>
			<button id="delete" text="선택삭제" icon="vicon.delete_defalut">
			<button id="applyPassword" text="비밀번호 변경" icon="vicon.asterisk_orange">
			<button id="apply" text="적용" icon="vicon.database_save">
		</hbox>
	</page>
onInit() {
	db = Class.db('config');
	sql = "select dsn, driver, server, dbnm, uid, pwd, port from db_info";
	this[grid].check('treeMode', false);
	this[grid].model(localModel(),
		"check:*#40, dsn:DB아이디#90, driver:경로/드라이버#180, server:서버#110, dbnm:데이터베이스명#190, uid:사용자#80, pwd:비밀번호#80, port:포트#70");
	this[applyPassword].hide();
	this.search();

}

apply.onClick() {
	&insert 		= class('db').insertQuery('db_info', 'dsn, driver, server, dbnm, uid, pwd, port');
	&update 	= class('db').updateQuery('db_info', 'driver, server, dbnm, uid,  port', 'dsn');
	root = this[grid].rootNode();
	while( cur, root ) {
		pw=cur[pwd].encode();
		cur[pwd]=pw;
		if( cur.state(NODE.add) ) {
			db.exec(insert,cur); 
		} else if( cur.state(NODE.modify) ) {
			db.exec(update,cur);
		}	
	}
	this.search();
}

applyPassword.onClick() {
	while( cur, this[grid].rootNode() ) {
		not( cur[checked] ) continue;
		db.exec("update db_info set pwd=#{pwd} where dsn=#{dsn}", cur);
	}
	this.search();
}

grid.onDraw() {
	this.drawGrid(@draw, @node );
}

grid.onClicked() {
	b1=this[applyPassword], b2=this[delete];
	_check=func(grid, node) { 
		node.toggle('checked');
		grid.update();
		bchk = false;
		while( cur, grid.rootNode() ) {
			if( cur[checked] ) {
				bchk=true;
				break;
			}
		}
		if( bchk ) {
			b1.show(), b2.show();
		} else {
			b1.hide(), b2.hide();
		} 
	};
	switch( @column ) {
	case 0: 
		_check(@me, @node);
	default:
		@me.edit(@node,@column); 
	}
}

grid.onEditEvent(type, node, data, index) {
	&pos = @me.offset(); 
	&hh = @me.headerHeight();
	switch(type) {
	case create:		 
		@me.check('sortEnable',false);
		return this.gridInput(index);
	case finish:
		field=@me.field(index);  
		not( node[$field].eq(data) ) {
			not( node.state(NODE.add) ) {
				node.state(NODE.modify, true);
			}
			if( field.eq('pwd') ) {
				node[$field] = data.encode();
			} else {
				node[$field] = data;
			}
		}
		@me.update();
		@me.check('sortEnable',true);
	default: return;
	}
}

add.onClick() {
	root = this[grid].rootNode();
	cur= root.addNode();
	gridAddRow(this[grid], cur, 1);
}

delete.onClick() {
	not( this.confirm("선택된 DB연결을 삭제하시겠습니까?") ) {
		return;
	}
	while( cur, this.grid.rootNode() ) {
		not( cur[checked] ) continue;
		db.exec("delete from db_info where dsn=#{dsn}", cur);
	}
	this.search();
}

reload.onClick() {
	this.search();
}

gridInput( index) {
	input  = {
		tag: input, 
		onKeyDown() {
			not( @key.eq( KEY.Enter, KEY.Return) ) return; 
			this[mainWindow].nextFocus(this, @mode&KEY.ctrl);
		}
		init( main, index) {
			this[mainWindow] = main;
			this[index] = index;
		}
	}
	input.init( this, index);
	return input;
}

nextFocus(input, ctrl) {
	node = this[grid].current();
	if( ctrl ) {
		next = this[grid].nextNode(node);
		if( next ) {
			this[grid].current(next);
			this.delay( callback() {
				this[grid].edit(next,input[index]);
			});	
		} else {
			this.delay( callback() {
				this.fireEvent('add.onClick');
			});
		}
	} else {
		index = input[index] + 1;
		if( index>6 ) return;
		this.delay( callback() {
			this[grid].edit(node,index);
			this[grid].scroll(node,index);
		});	
	}
}

search() {
	root = this[grid].rootNode();
	root.removeAll();
	db.fetchAll(sql, root);
	this[grid].selectClear();
	this[grid].update();
	this[delete].hide();
}

drawGrid(d, node) {
	grid = this[grid];
	rc=d.rect();
	modify = drawGridModify(d,node,rc);
	not( modify ) {
		if( d.state(STYLE.Selected) ) {	
			d.fill( rc, '#f0f0f0' );
		} else {
			d.fill();
		}
	}
	field=grid.field(d.index());
	switch( field ) {
	case check:		
		if( node[checked] ) {
			d.icon(rc.center(16.16), Icon.func.check);
		} else {
			d.icon(rc.center(16.16), Icon.func.add);
		}
	case pwd:
		d.text( rc.incrX(2), node[$field].decode() );	
	default:
		d.text( rc.incrX(2), node[$field] );	
	} 
	d.rectLine(rc,4,'#d0d0d0');
	if( modify ) this[apply].show();
}

## 쿼리실행
layout: <page>
	<splitter stretchFactor="content">
		<tree id="tree">
		<vbox id="content" margin="4,0,4,0">
			<splitter type="vbox">
				<vbox margin="0,0,0,0">
					<grid id="grid">
					<hbox>
						<button id="applyData" text="적용"><label id="gridStatus" stretch=1><label text="DB연결 : "><combo id="dbCombo">
					</hbox>
				</vbox>
				<vbox margin="0,0,0,0">
					<editor id="sqlEditor">
					<hbox>
						<button id="runQuery" text="쿼리실행">
						<space>	
						<input id="inputTitle">
						<check id="checkTreeNode" text="트리노드 생성">
					</hbox>
				</vbox>
			</splitter>
		</vbox>
	</splitter>
</page>
onInit() {
	include("KioskHiTec/widget.QueryTest");
	x=newClass("KioskHiTec/widget.QueryTest", this);
	x.initTree();
}


QueryTest(page) {
	this.addClass(common.Config, dev.EditorSrcChange, dev.EditorSrcClick );
	db=Class.db('config');
	
	/* #################### Tree #################### */
	tree=page.tree;
	tree.check('treeMode', true);
	tree.model(Class.model('QueryTestTree'), 'value');
	
	tree.eventMap(onChildData, this.treeChildData, 'node');
	tree.eventMap(onDraw, this.treeDraw, 'draw, node, over');
	tree.eventMap(onChange, this.treeChange, 'node');
	
	/* #################### Grid #################### */
	grid=page.grid;
	dataModel=Class.model('QueryTestGrid');
	grid.check('sortEnable', true);
	
	/* 그리드 이벤트 맵핑  */
	grid.eventMap(onDraw, this.gridDraw, 'draw, node, over');
	grid.eventMap(onClicked, this.gridClick, 'node, column');
	grid.eventMap(onChange, this.gridChange, 'node');
	grid.eventMap(onDoubleClicked, this.gridDoubleClick , 'node');
	grid.eventMap(onEditEvent, this.gridEditEvent, 'type, node, data, index');
	
	/* 그리드 헤더폭을 자동 계산  */
	if( gridHeaderWidth(grid) ) {
		grid.eventMap(onResize, this.gridResize);
	}
	/* #################### editor #################### */
	editor=  page.sqlEditor;
	
	not( editor ) return;
	editor.syntax( conf('syntax.sql') );
	editor.eventMap( onMouseClick, this.editorMouseClick, 'pos, keys' );
	editor.eventMap( onChange, this.editorChange );
	editor.eventMap( onKeyDown, this.sqlEditorKeyDown, 'key,mode' );
	
	this.initPage();
}

initTree() {
}

treeDraw(draw, node, over) {
	rc=treeIcon(tree, draw, node, over);
	rcIcon = rc.width(18).center(16,16);
	rc.incrX(20);
	switch( node[type] ) {
	case ROOT:
		draw.icon( rcIcon, "vicon.application_form" );
		draw.save().font('bold');
		draw.text( rc,  node[title]);
		draw.restore();
	default:
		switch(node[depth]) {
		case 1:	icon='vicon.application_side_boxes';
		case 2:	icon='vicon.application_view_list';
		case 3:	icon= 'vicon.page_red';
		}
		draw.icon( rcIcon, icon );
		if( node[@field] ) {
			field=node[@field];
			val=getCommCodeValue("@vrs#${field}", node[value]);
			draw.text(rc, val);
		} else {
			draw.text( rc,  node[value]);
		}
		if( node[type] ) {
			type=node[type];
			if( type.start('timestamp') ) {
				type='date';
 			} else if( type.find('varying') ) {
 				type='varchar';
 			}
			w=draw.textWidth(type)+10;
			draw.text(rc.move('end',w), type);
		}
	}
}

treeMouseClick(pos, button) {
	if( button.eq('right') ) return 'ignore';
}

treeChange(node) {
	p=node.parent();
	if( p[kind].eq('table_info') ) {
		table=node[value];
		switch( db[dbms] ) {
		case sqlite:
			sql=null;
			sqlTable="SELECT * FROM $table limit 0, 50";
		case mssql:
			sql="select 2 depth, column_name as value, data_type + '(' +cast(character_maximum_length as varchar) +')' as type from information_schema.columns where table_name=#{value} order by ordinal_position";
			sqlTable="SELECT TOP 10 * FROM $table";
		case postgres:
			sql="select 2 depth, column_name as value,data_type as type from information_schema.columns where table_name=#{value}";
			sqlTable="SELECT * FROM $table limit 50 offset 0";
		}
		if( sql ) db.fetchAll(sql, node);
		if( sqlTable ) {
			this.makeGrid(sqlTable);
			editor.move('end');
			editor.insert("\n$sqlTable\n");
		}
		if( this.prevSelectNode ) {
			tree.expand(this.prevSelectNode, false);
		}
		tree.expand(node);
		this.prevSelectNode=node;
	}
	if( node[type] ) {
		val=node[value].lower();
		page[sqlEditor].insert(" $val");
		page[sqlEditor].focus();
	}
}

initGrid() {
	fields=grid.fields();
	gridMakeField(tr('data#fields.QueryTest'),true, fields);
	grid.model( dataModel, fields);
	gridHeaderWidth(grid);
}

searchGrid() {
	root=grid.rootNode();
	/* 조회 쿼리를 넣어준다*/
	db.fetchAll("", root.removeAll() );
	grid.update();
	page.deletePage.hide();
	gridHeaderWidth(grid);
}

gridChange(node) {
	
}

gridDoubleClick(node) {
	
}

gridResize() {
	gridHeaderWidth(grid);
}

gridDraw(draw, node, over) {
	rc=draw.rect();
	field=grid.field(draw.index());
	gridOver(draw, node, over);
	switch( field ) {
	case check:
		rcIcon=rc.center(16,16);
		if( node.state(NODE.add) )
			gridModifyMark(draw, rc, '#a090ea');
		if( node[checked] ) 
			draw.icon(rcIcon, 'func.check');
		else
			draw.icon(rcIcon, 'func.add');
	default: 
		draw.text(rc, node[$field].trim());
	}
	if( node.state(NODE.modify), node[modify#$field] ) {
		gridModifyMark(draw, rc);
	}
	draw.rectLine(rc,4,'#d0d0d0');
 }

gridClick(node, column) {
	field=grid.field(column);
	switch( field ) {
	case check:	gridCheck(grid, node, page.deletePage );
	default:			grid.edit(node, column);
	}
}

gridEditEvent(type, node, data, index) {
	field=grid.field(index);
	switch( type ) {
	case create:
		return null;
	case geometry:
		rc=data;
		return rc;
	case finish:
		not( node[$field].eq(data) ) {
			not( node.state(NODE.add) ) {
				node.state(NODE.modify,true);
				node[modify#$field]=true;
				page[applyData].enable();
			}
			node[$field]=data;
		}
		grid.update();
	default: break;
	}
}

initPage() {
	root=tree.rootNode().removeAll();
	root.addNode({depth:0, type:ROOT, title: 조회트리});
	page[applyData].enable(false);
	
	page[runQuery].eventMap( onClick, this.runQueryClick);
	tree.update();
	
	combo=page[dbCombo];
	setCommCombo(combo, 'kiosk#dbinfo', '=DB선택=');
	combo.eventMap( onChange, this.dbInfoChange );
	
	grid.model(dataModel, gridMakeField('id:id, value:value',true) );
}

test() {
 	grid.model(dataModel, gridMakeField('id:id, value:value',true) );
 }

runQueryClick() {
	sql=editor.text('select');
	not( sql ) {
		sql=editor.value();
	}
	not( sql ) {
		page.alert("쿼리를 입력하세요");
	}
	type=sql.move().trim().lower();
	if( type.eq('insert', 'update', 'delete') ) {
		db.exec(sql);
		err=db.error();
		if( err ) {
			p=this[page];
			p.alert("DB 실행 오류 : $err");
		}
		return;
	}
	
	
	dataNode=_node(this,'dataNode');
	
	sep=conf('message.StringSep');
	if( sql.find(sep) ) {
		s=sql.str();
		query=s.findPos(sep);
		while( s.valid() ) {
			key=s.findPos("\n").trim(), codeQuery=s.findPos(sep);
			not( key ) break;
			db.fetchAll(codeQuery, dataNode.removeAll() );
			makeCommCode(key, dataNode);
		}
		sql=query.trim();
	}
	if( page[checkTreeNode].checked() ) {
		this.makeTree(sql, dataNode.removeAll() );
	} else {
		this.makeGrid(sql);
	}
}

dbInfoChange() {
	combo=page[dbCombo];
	val=combo.value();
	not( val ) return;
	@db=Class.db(val);
	if( val.eq('kiosk_local') ) {
		not( db.open() ) { 
			path="data/namzatang.db";
			not( Class.file().isFile(path) ) {
				projectCode=Cf[projectCode];
				path="project/$projectCode/data/namzatang.db";
			}
			db.open(path);
		}
	}
	not( db[dbms] ) db[dbms]='sqlite';
	this.setDbTableInfo();
}

setDbTableInfo(dbms) {
	root=tree.rootNode().child(0);
	switch( db[dbms] ) {
	case sqlite:
		sql="select 1 depth, tbl_name as value from sqlite_master order by name ";
	case mssql:
		sql="select 1 depth, table_name as value from information_schema.tables order by table_name";
	case postgres:
		sql="select 1 depth, tablename as value from pg_tables where schemaname='public' order by tablename";
	}
	db.fetchAll(sql, root.removeAll() );
	root[kind]='table_info';
	root[title]="테이블 정보";
	tree.update();
	tree.expand(root, true);
}

makeTree(sql, dataNode) {
	root=tree.rootNode().child(0);
	groupBy=page[inputTitle].value();
	db.fetchAll( sql, dataNode );
	
	print( sql, dataNode);
	makeTreeNode(root.removeAll(), dataNode, groupBy);
	root[kind]='make_tree';
	root[title]="쿼리 조회";
	tree.update();
}

makeGrid(sql) {
	root=grid.rootNode();
	db.fetchAll(sql, root.removeAll(), true ), err=db.error();
		if( err ) {
			page.alert("DB조회 오류 :\n $err");
			grid.update();
			return;
		}
	
	node= root.child(0);
	if( node ) {
		s="";
		while( field, root[@fields], n, 0) {
			w=gridMaxFiledWidth(root, field);
			if( n ) s.add(",");
			s.add("$field:$field #", min(w,350) );
		}
		model=grid.model(), fields=grid.fields();
		gridMakeField(s, true, fields);
		grid.model(model, fields);
	}
	total=root.childCount();
	page[gridStatus].value("(총 $total 건)");
	page[applyData].enable(false);
	grid.update();
}

sqlEditorKeyDown(key, mode) {
	if( this.editorKeyDown( key, mode) ) 
		return true;
	not( mode&KEY.ctrl ) return false;
	
	switch(key) {
	case KEY.R: 			this.runQueryClick();
	}
	return false;
}

## 