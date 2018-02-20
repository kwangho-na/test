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