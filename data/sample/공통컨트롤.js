## 메뉴
MyMenu(tag, parentCtrl) {
	parentCtrl.inject(db, cf, xmlNode);
	this.addClass('common/control.PageBase');
	this.initControl();
}

initControl() {
	/* 전역 마우스 이벤트 처리 */
	tag[GlobalMouseUse]=true;
	
	setNodeSize(tag, true);
	tag.addNode({tag: MenuBar});
	tag.addNode({tag: MenuStatus});
	
	this.setMenu();
}

conf() {
	/* 메뉴 영역 설정 */
	confMenu=func(node, rc) {
		divideRect(node, rc,
			'250,*',
			'image, menu'
		);
		node[rect menu].inject(x,y,w,h), right=x+w;
		while( menu, node ) {
			tw=textWidth(14, menu[value])+40;
			menu[rect]			=Class.rect(x,y,tw,h), x+=tw;
			menu[rect sep]		=Class.rect(x,y,8,h), x+=8;
		}
		tw=right-x;
		if( tw<=0 ) tw=1;
		node[rect background]=Class.rect(x,y,tw,h);
	};
	
	/* 영역설정*/
	divideRect( tag, tag[rect], "60,*", null, true);
	while( cur, tag ) {
		switch( cur[tag] ) {
		case MenuBar:	confMenu(cur, cur[rect]);
		case MenuStatus:
		default:
		}
	}
}

draw(draw, tm) {
	draw.mode();
	drawNodeStyle(draw, tag);
	/* 메뉴 그리기 */
	drawMenu=func(node) {
		draw.drawImage( node[rect image], commonImage('menu_bg'), 'fill' );
		rcLogo=node[rect image],width(200);
		draw.font(16,'bold','#d0d0d0').text( rcLogo, '고속도로 KIOSK', 'center');
		
		while( menu, node ) {
			rcText=menu[rect text].incrY(18);
			divideRect(menu, menu[rect], '9,*,8', 'left, text, right');
			if( menu[selected] ) {
				draw.drawImage( menu[rect left], 	commonImage('menu_tab1') );
				draw.drawImage( menu[rect text], 	commonImage('menu_tab2'), 'fill' );
				draw.drawImage( menu[rect right],	commonImage('menu_tab3') );
				textImage(draw, menu, rcText, menu[value], 'menuSelect');
			} else {
				draw.drawImage( menu[rect], commonImage('menu_bg'), 'fill' );
				menu[drawObject]=null;
				textImage(draw, menu, rcText, menu[value], 'menuNormal');
				draw.drawImage( menu[rect text].move('end', 12), commonImage('menu_down') );
			}
			draw.drawImage( menu[rect sep], 	commonImage('menu_bg'), 'fill' );
			if( menu[rect].eq(this.mouseOverRect) ) {
				draw.fill(rcText.incr(-3), '#c0cad040');
			}
		}
		draw.drawImage( node[rect background], commonImage('menu_bg'), 'fill' );
	};
	
	/* 그리기 태그 처리 */
	while( cur, tag ) {
		switch( cur[tag] ) {
		case MenuBar: drawMenu(cur);
		case MenuStatus:
			rc=cur[rect];
			draw.fill( rc, '#ffffff').rectLine( rc, 4, '#202020');
			draw.rectLine( cur[rect].incrY(1,true), 4, '#c0c0c0');
			draw.font(12, "normal", '#9090a0').text(rc.incrX(10), cur[text]);
		default:
		}
	}
}

mouseDown(pos) {
	while( cur, tag ) {
		switch( cur[tag] ) {
		case MenuBar:
			if( cf[submenuNode] ) {
				while(sub, cf[submenuNode] ) {
					not( sub[rect].contains(pos) ) continue;
					this.setCurrentMenu(sub);
					return;
				}
			}
			while( menu, cur ) {
				not( menu[rect].contains(pos) ) continue;
				if( menu[selected] && cf[submenuNode] ) return;
				this.menuChange(menu);
				return;
			}
		default:
		}
	}
	
	if( cf[submenuNode] ) {
		this.closeSubmenu();
	}
}

mouseUp(pos) {
}

test() {
	this.setMenu();
	this.conf();
	this.update();
}

setMenu(data) {
	not( data ) data=conf('data.menu');
	root=findTag('MenuBar',tag).removeAll();
	
	parseMenu=func(s) {
		menu=null;
		while( s.valid() ) {
			line=s.findPos("\n");
			not( line.ch() ) continue;
			if( line.ch().eq('-') ) {
				line.incr();
				sub=menu.addNode({tag:submenu});
				sub[value]=line.findPos('#').trim();
				if( line.valid() ) sub.parseJson(line);
			} else {
				line.findPos('.');
				menu=root.addNode({tag:menu});
				menu[value]=line.trim();
			}
		}
	};
	parseMenu(data.ref() );
	printNode(root);
}

mouseMove(pos) {
	while( cur, tag ) {
		switch( cur[tag] ) {
		case MenuBar:
			if( cf[submenuNode] ) {
				while(sub, cf[submenuNode] ) {
					not( sub[rect].contains(pos) ) continue;
					if( sub[rect].eq(this.mouseOverRect) ) return;
					this.mouseOverRect=sub[rect];
					this.update();
					return;
				}
			}
			while( menu, cur ) {
				not( menu[rect].contains(pos) ) continue;
				if( menu[selected] ) {
					break;
				}
				if( menu[rect].eq(this.mouseOverRect) ) return;
				this.mouseOverRect=menu[rect];
				this.update();
				return;
			}
		default:
		}
	}
	if( this[mouseOverRect] ) {
		this[mouseOverRect]=null;
		this.update();
	}
}

menuChange(menu) {
	while( cur, this.findTag('MenuBar') ) {
		if( cur==menu ) continue;
		if( cur[selected] ) cur[selected]=false;
	}
	menu[selected]=true;
	this.setSubmenu(menu);
	this.update();
}

setSubmenu(node, rc) {
	not( rc ) rc=node[rect].move('down');
	rc.inject(x, y, w, h);
	draw=node[draw submenu];
	not( draw ) {
		/* 최대 폭/높이 계산 */
		mw=0, mh=0;
		while( cur, node ) {
			tw=textWidth(12, cur[value] ) +35;
			if( mw<tw ) mw=tw;
			mh+=35;
		}
		if( mw< w ) mw=w;
		mh+=20;
		draw = Class.draw( mw, mh );
	}
	
	rcDraw=draw.rect();
	/* 출력 영역 */
	node[rect submenu]=Class.rect(x, y, rcDraw.size() );
	offset=Class.point(x,y);
	
	/* 그리기 영역 */
	divideRect( node, rcDraw, '*,14', 'body, bottom', true);
	divideRect( node, node[rect body], 		'9,*,10', 'box11,box12, box13');
	divideRect( node, node[rect bottom],	'9,*,10', 'box21,box22, box23');
	rcBody=node[rect box12];
	
	/* 배경 그리기 */
	draw.drawImage( node[rect box11], commonImage('submenu_box11'), 'fill' );
	draw.fill( rcBody, '#ffffff' );
	draw.drawImage( node[rect box13], commonImage('submenu_box13'), 'fill' );
	
	draw.drawImage( node[rect box21], commonImage('submenu_box21') );
	draw.drawImage( node[rect box22], commonImage('submenu_box22'), 'fill' );
	draw.drawImage( node[rect box23], commonImage('submenu_box23') );
	/* 텍스트 그리기 */
	rcBody.inject(x,y,w,h), x+=5, y+=8, h=34;
	while( cur, node ) {
		rc=Class.rect(x,y,w,h), y+=h;
		cur[rect]=rc.incrXY(offset, true);
		textImage(draw, cur, rc, cur[value], 'submenu' );
	}
	node[draw submenu]=draw;
	cf[submenuNode]=node;
	
	widgetNode=_node(cf,'widgetNode');
	while( pid, widgetNode.keys() ) widgetNode[$pid].hide();
	
	this.update();
}

setCurrentMenu(menu) {
	not( menu ) return;	 
	this[currentMenu]=menu;
	this.closeSubmenu();
	
	if( menu[id].eq('ClosePage') ) {
		this.findControl('#Content').pageLoad('LoginView');
		System.timeout(100);
		kw=Cf[KioskWatcher];
		kw.hide();
		return;
	}
	
	
	loginInfo=_node('LoginInfo');
	if( loginInfo[loginStartTick] ) {
		dist=System.tick() - loginInfo[loginStartTick];
		if( dist>200000 ) {
			this.findControl('#Content').pageLoad('LoginView');
			System.timeout(100);
			this.mainControl().alert("로그인 세션이 말료되었습니다. 다시 로그인 하세요", "알림");
			return;
		}
	} else {
		this.findControl('#Content').pageLoad('LoginView');
		System.timeout(100);
		this.mainControl().alert("로그인 정보가 없습니다. 로그인후 이용하세요.", "알림");
		return;
	}
	cf[inputFocusDraw]=null;
	/* 페이지 이동처리 */
	content = this.findControl('#Content');
	switch( menu[id] ) {
	case SalesOpen:
		content.pageLoad("AdminSaleOpen");
	case SlaesClose:
		content.pageLoad("AdminSaleClose");
	case SalesStatus:
		content.pageLoad("AdminSaleStatus");
	case SoldOut:
		content.pageLoad("AdminSoldOut");
	case ErrorView:
		content.pageLoad("ErrorView", "admin");
	case LogView:
		content.showPage('KioskLogViewer');
	case DbConnect:
		content.showPage('dbManager');
	case SetupInterface:
		content.pageLoad("KeyboardTool");
	case ClosePage:
		this.findControl('#Content').pageLoad('LoginView');
		System.timeout(100);
		kw=Cf[KioskWatcher];
		kw.hide();
	case ExitPage:
		main=this.mainControl();
		mainPage=main[page];
		not( mainPage.confirm("프로그램을 닫으면 자동업데이트 및 에러처리를 하지못하게 됩니다.\n프로그램을 닫으시겠습니까?") ) {
			return;
		}
		mainPage[tray].hide();
		Cf.exit();
	case InterfaceManager:
		content.pageLoad("KeyboardTool");
	case NetworkTool:
		content.showPage('PingTest');
	case OrderTool:
		content.showPage('OrderTool');
	case DbTool:
		content.showPage('DbQuery');
	case ProcessTool:
		content.showPage('processInfoView');
	case ProtocalTool:
		content.showPage('protocalTest');
	case KeyboardTool:
		content.pageLoad("KeyboardTool");
	default:
		content.pageLoad(menu[id],"admin");
	}
	
	print(menu,  content.pageLoad );
	status=this.findTag('MenuStatus');
	p=menu.parent();
	status[text]="관리자 메뉴 : $p[value] > $menu[value]";
}

closeSubmenu() {
	while( cur, this.findTag('MenuBar') ) {
		if( cur[selected] ) cur[selected]=false;
	}
	cur=this[currentMenu];
	if( cur ) {
		pp=cur.parent();
		pp[selected]=true;
	}
	
	/* 서브 메뉴 창을 닫고, 선택 메뉴를 변경한다. */
	cf[submenuNode]=null;
	this.update();
}

/*  메뉴정보 출력  */
setMenuStatus(info) {
	this.update();
}

/* 팝업 메뉴 처리 */
/*
	if( cf[submenuNode] ) {
		node=cf[submenuNode];
		draw.drawImage(node[rect submenu].incrX(1), node[draw submenu]);
		menu=this.findControl('VrsMenu');
		while(sub, node) {
			not( sub[rect].eq(menu.mouseOverRect) ) continue;
			rc=sub[rect].incrX(-10).incrW(4);
			if( sub==this[currentMenu] ) {
				draw.fill(rc, '#c0cad060');
			} else {
				draw.fill(rc, '#dacad040');
			}
		}
	}	
*/


## 팝업 컨트롤

Popup(tag, parentCtrl) {
	parentCtrl.inject(db, cf, xmlNode);
	this.addClass('common/control.PageBase');
}

conf() {
	not( this[mainNode] ) return;
	this.getControl( this[mainNode] ).conf();
}

draw(draw, timeline) {
	not( this[mainNode] ) return;
	this.getControl( this[mainNode] ).draw(draw, timeline);
}

getMainNode() {
	return this.mainNode;
}

mouseDown(pos) {
	not( this[mainNode] ) return;
	main=this[mainNode];
	if( main[autoClose] ) {
		if( cf[popupControl]== this ) {
			not( tag[rect].contains(pos) ) {
				this.popupClose();
			}
		}
	}
	this.getControl( main ).mouseDown(pos);
}

mouseUp(pos) {
	not( this[mainNode] ) return;
	this.getControl( this[mainNode] ).mouseUp(pos);
}

mouseMove(pos) {
	not( this[mainNode] ) return;
	this.getControl( this[mainNode] ).mouseMove(pos);
}

popupClose() {
	cf[inputNode]=null;
	not( this[mainNode] ) return;
	ctrl=this.getControl( this[mainNode] );
	if( ctrl.popupCloseEvent ) {
		ctrl.popupCloseEvent();
	}
	if( ctrl.drawFadeOut ) {
		this.timelineStart('FadeOutPopup', this, 'FadeOut');
	}
	if( cf[errorOpen] ) return;
	cf[popupControl]=null;
	this[mainNode]=null;
	this.update();
}

popupOpen(tagId, path, var) {
	not( tagId ) return;
	this.mainControl().popupClose();
	cur=tag.findOne('tag', tagId);
	not( cur ) {
		cur=tag.addNode();
		cur[tag]=tagId;
	}
	
	check=cf[classErrorCheck];
	if( path ) {
		cur[ClassPath]=path;
		classId="$path/control.$tagId";
	} else {
		cf.inject(projectId, pageCode);
		classId="${projectId}/${pageCode}/control.$tagId";
	}
	if( check[$classId] ) {
		check[$classId]=false;
	}
	not( this.getControl(cur) ) {
		_log("popupOpen error: 태그아이디: $tagId");
		return false;
	}
	
	/* 팝업 영역 설정 */
	mainNode=this.mainControl().getMainNode();
	
	args(2,rect, target, style );
	not( rect ) {
		if( cur[Width] && cur[Height] ) {
			w=cur[Width], h=cur[Height];
			rect=Class.rect(0,0,w,h);
		} else{
			not( target ) {
				target=mainNode[rect];
			}
			rect=target.incr(40);
		}
	}
	
	/* 대상이
		- 영역이: 영역가운데,
		- 포인트: x,y 위치
		오픈 위치를 세팅
	*/
	if( typeof(target,'point') ) {
		tag[rect]=rect.incrXY( target, true);
	} else {
		not( typeof(target,'rect') ) {
			target=mainNode[rect];
		}
		if( style.eq('popup') ) {
			if( target.right() < rect.right() ) {
				dist= rect.right()-target.right(), dist*=-1;
				rect.incrX(dist);
			}
			tag[rect]=rect.incrY(8, true);
		} else {
			tag[rect]=target.center(rect);
		}
	}
	/* 자식에 설정된 영역 삭제 */
	tagClearRect(cur);
	
	cur[rect]=tag[rect];
	this.mainNode=cur;
	
	cf[popupStartTick]=System.tick();
	cf[popupControl]=this;
	
	ctrl=this.getControl(cur);
	if( ctrl.initPage ) {
		ctrl.initPage();
	}
	if( ctrl.drawFadeIn ) {
			this.mainControl().timelineStart('FadeInPopup', this, 'FadeIn');
	}
	
	this.conf();
	this.update();
	return ctrl;
}

stackPageOpen(tagId, path) {
	not( tagId ) return;
	cur=tag.findOne('tag', tagId);
	not( cur ) {
		cur=tag.addNode();
		cur[tag]=tagId;
	}
	
	check=cf[classErrorCheck];
	if( path ) {
		cur[ClassPath]=path;
		classId="$path/control.$tagId";
	} else {
		cf.inject(projectId, pageCode);
		classId="${projectId}/${pageCode}/control.$tagId";
	}
	if( check[$classId] ) {
		check[$classId]=false;
	}
	this.stackPageUpdate(cur);
}

stackPageClose() {
	not( this[mainNode] ) return;
	cf[stackPage]=null;
	ctrl=this.getControl( this[mainNode] );
	if( ctrl.pageCloseEvent ) {
		ctrl.pageCloseEvent();
	}
	if( ctrl.pageCloseEffect ) {
		this.timelineStart('PageEffect',  this, 'close');
	}
	this[mainNode]=null;
	this.update();
}

stackPageLoad(pageId) {
	cur=tag.findOne('id', pageId);
	not( cur ) {
		src=conf("page#xml.kiosk#$pageId");
		not( src ) {
			return;
		}
		cf.inject(imagePath, projectId, pageCode);
		cur= this.parseXml( fmt(src), tag );
		cur[id]=pageId;
	}
	this.stackPageUpdate(cur);
}

stackPageUpdate(cur) {
	this.mainNode=cur;
	ctrl=this.getControl(cur);
	
	/* 자식에 설정된 영역 삭제 */
	tagClearRect(cur);
	
	tag[rect]=this.mainControl().getPageRect();
	cur[rect]=tag[rect];
	
	cf[stackPage]=this;
	this.conf();
	
	/* 페이지 시작 효과처리 */
	if( ctrl.pageOpenEvent ) {
		this.timelineStart('PageEffect',  this, 'open');
	} else {
		this.update();
	}
}

test() {
	x=this.findControl('Popup#dialog');
	x.popupOpen('OrderConfirm', 'popup', 936, 1244);
	
	p=Cf[KioskWatcher];
	p.inject(cf);
	db=Class.db('kiosk_hitec');
	
	not( cf[prod_img_url] ) {
		db.fetch("select prod_img_url from hitec_x10s limit 1 offset 0", cf);
	}
	
	_log("다운로드 시작: tag=$tag, 이미지 경로: $path URL: $url");
	url=cf[prod_img_url], path=conf("setup#kiosk.imagePath");
	root=_node();
	db.fetchAll("SELECT goods_cd, goods_img FROM hitec_m10s", root);
	
	p.downloadMenuImage(url, root, "$path/menus");
}

pageOpen(pageId) {
	this.findControl('Popup#stack').stackPageLoad(pageId);
}

pageClose() {
	this.findControl('Popup#stack').stackPageClose();
}

## 컨텐트 컨트롤
Content(tag, parentCtrl) {
	parentCtrl.inject(db, cf, xmlNode);
	this[pageNode]=null;
	this.addClass('common/control.PageBase');
	this.initControl();
}

initControl() {
	setNodeSize(tag, true);
}

conf() {
	main=this[pageNode];
	not( main ) return;
	tagClearRect(main);
	if( cf[pageMode].eq('full') ) {
		main.varMap(tag, 'rect, Width, Height', true);
		setNodeSize(main, true);
	} else {
		main[rect]=null;
		setNodeSize(main, true);
		if( main[rect] ) {
			rc=main[rect], r=rc.right(), b=rc.bottom();
			tag[rect]=rc;
			ctrl=this.mainControl();
			ctrl[canvas].size(r,b);
		}
	}
	this.getControl(main).conf();
}

findPageNode(tagName) {
	return findTag(tagName, this[pageNode]);
}

draw(draw, tm) {
	/* 위젯 그리기 */
	subpage=this[currentShowPage];
	if( subpage ) {
		this.mainControl().drawSubPage(draw, subpage, tag[rect]);
		return;
	}
	/* 캔버스 그리기 */
	subpage=this[pageNode];
	if( subpage ) {
		if( subpage[bg] ) {
			tag[bg]=subpage[bg];
		}
		if( tag[bg] ) {
			draw.drawImage(tag[rect], imageLoad(tag, "bg"), 'fill');
		}
		this.getControl(subpage).draw(draw, tm);
	}
}

mouseDown(pos) {
	main=this[pageNode];
	not( main ) return;
	this.getControl(main).mouseDown(pos);
}

mouseUp(pos) {
	main=this[pageNode];
	not( main ) return;
	this.getControl(main).mouseUp(pos);
}

mouseMove(pos) {
	main=this[pageNode];
	not( main ) return;
	this.getControl(main).mouseMove(pos);
}

setPage(pageId, projectId) {
	not( projectId ) projectId=cf[projectId];
	id="${projectId}.${pageId}";
	node=tag.findOne('id',id);
	if( node ) {
		print("## $id =>$node");
		this.setPageNode(node);
		return;
	}
	cf.inject(imagePath);
	pageXml=getPageXml(projectId, pageId);
	node=this.parseXml( fmt(pageXml), tag );
	node[id]=id;
	if( node[tag].eq('Page') ) {
		node[tag]="SubPage";
	}
	/* 서브페이지 처리 (팝업, 클래스 경로 설정) */
	arr=_arr();
		while( cur, node ) {
		if( cur[tag].eq('Popup') ) {
			not( cur[ClassPath] ) cur[ClassPath]='common';
			arr.add(cur);
		} else {
			not( cur[ClassPath] ) cur[ClassPath]="${projectId}/${pageId}";
		}
	}
	while( cur, arr ) {
		node.remove(cur);
	}
	root=xmlNode.child(0);
	while( cur, arr ) {
		root.addNode(cur);
	}
	this.setPageNode(node);
	
	/* test code */
	switch( pageId ) {
	case MyGrid:
		gird=this.findPageNode('GridContol');
		this.getControl(grid).test();
	default:
		cur=node.child(0);
		this.getControl(cur).test();
	}
}

setPageNode(node) {
	this[pageNode]=node;
	this.conf();
	this.update();
}

test() {
	tag.removeAll();
	
	this.pageLoad('LoginView');
}

showPage(pageId, projectId) {
	print("showPage=========$pageId");
	cf[inputNode]=null;
	if( this[currentShowPage] ) {
		this[currentShowPage].hide();
	}
	not( projectId ) projectId=cf[projectId];
	id="${projectId}.${pageId}";
	widget=this.mainControl().showWidget(id, tag[rect]);
	not( widget ) return null;
	
	find=tag.findOne('pageId', id);
	not( find ) {
		widget[id]=pageId;
		widget[pageId]=id;
		tag.addNode(widget);
	}
	this[currentShowPage]=widget;
	return widget;
}

pageLoad(pageId, path) {
	cf[inputNode]=null;
	cur=tag.findOne('id', pageId);
	not( cur ) {
		src=conf("page#xml.kiosk#$pageId");
		if( src ) {
			cf.inject(imagePath, projectId, pageCode);
			cur= this.parseXml( fmt(src), tag );
		} else {
			cur=tag.addNode();
			cur[tag]	=pageId;
		}
		not( path ) {
			path=nvl( cur[ClassPath], 'tool' );
		}
		cur[id]=pageId;
		cur[ClassPath]=path;
	}
	if( cur[ClassPath].eq('admin') ) {
		cf.pageMode='scroll';
	} else {
		cf.pageMode='full';
	}
	ctrl=this.getControl(cur);
	not( ctrl ) {
		print("Content::pageLoad error => $pageId 로딩 실패 ");
		return;
	}
	this[pageNode]=cur;
	this.conf();
	if( this[currentShowPage] ) {
		this[currentShowPage].hide();
		this[currentShowPage]=null;
	}
	/* 자동으로 조회되도록 한다 */
	if( ctrl.search ) {
		ctrl.search();
	}
	/* 페이지 열기 애니메이션 */
	if( ctrl.pageOpenEvent ) {
		this.timelineStart('PageEffect',  this, 'open');
	} else {
		this.update();
	}
}

popupOpen(pageId, parent, rect, style, path) {
	not( path ) {
		path='common';
	}
	not( style ) style="popup";
	tag=parent[tag];
	dlg=this.findControl('Popup#dialog');
	dlg.popupOpen(pageId, path, rect, tag[rect], style);
	node=dlg[mainNode];
	if( node ) {
		node[openerControl]=parent;
		node[autoClose]=true;
	}
	return node;
}




## 그리드 컨트롤

GridControl(tag, parentCtrl) {
	parentCtrl.inject(db, cf, xmlNode);
	this.addClass('common/control.PageBase');
	this.initControl();
}

initControl() {
	setNodeSize(tag, true);
		tag.addNode({tag: Header, Height:65});
		tag.addNode({tag: Body });
		tag.addNode({tag: Status, Height:85});
		this.listNum=16;
		this.listHeight=40;
		this.startRow=0;
}

conf() {
	while( cur, tagRect(tag, true) ) {
		switch( cur[tag] ) {
		case Header:
			cur[rect].inject(sx, sy, sw, sh );
			makeHeaderWidth(cur, sw);
			header=cur;
			cx=sx, ch=header[Height];
			while( sub, header, n, 0 ) {
					cw=sub[width];
					sub[rect]=Class.rect( cx, sy, cw, ch), cx+=cw;
				}
			case Body:
				hh=cur[rect].height();
				hh/=this.listHeight;
				this.listNum=hh;
				this.confBody(cur);
			case Status:
				rectRateArray(cur[rect],'140, *, 200, 55, 8, 55,10').inject(
					rcApply, space, rcStatus, rcUp, space, rcDown
				);
				cur.put(rcApply, space, rcStatus, rcUp, space, rcDown);
		default:
		}
	}
}

confBody(body) {
	header=this.findTag('Header');
	not( body ) body=this.findTag('Body');
	sp=this.startRow, ep=sp+this.listNum, ch=this.listHeight;
	root=this.dataNode;
	
	body[rect].inject(sx, sy, sw, sh );
	while( n, ep, sp ) {
		record=root.child(n);
		not( record ) break;
		cx=sx;
		record[rect]=Class.rect( cx, sy, sw, ch);
		while( sub, header, col, 0 ) {
			cw=sub[width];
			record[rect $col]=Class.rect( cx, sy, cw, ch), cx+=cw;
		}
		sy+=ch;
	}
}

draw(draw, tm) {
	sp=this.startRow, ep=sp+this.listNum, root=this.dataNode;
	funcDraw=parentCtrl.drawGrid;
	while( cur, tag ) {
		switch( cur[tag] ) {
		case Header:
			header=cur;
			draw.font(15, 'bold', '#f0f0f0');
			while( sub, header, col, 0 ) {
				rc=sub[rect];
				draw.fill( rc , '#424243');
				draw.text(rc, sub[text], 'center');
				if( col )
					draw.rectLine( rc, 234, '#606062', 4);
				else
					draw.rectLine( rc, 0, '#606062', 4);
			}
		case Body:
			draw.rectLine( cur[rect], 13, '#606062', 4);
			draw.font(14, 'normal', '#f0f0f0');
			not( root.childCount() ) {
				rc=cur[rect].height(60);
				draw.fill(rc, '#4f4f50').rectLine( rc, 134, '#606062', 4);
				draw.text(rc, "조회된 결과가 없습니다", "center");
				continue;
			}
			while( n, ep, sp ) {
				record=root.child(n);
				not( record ) {
					break;
				}
				while( sub, header, col, 0 ) {
					rc=record[rect $col], field=sub[code];
					draw.fill( rc, '#4f4f50');
					if( typeof(funcDraw,'function') ) {
						funcDraw(draw, rc, record, field);
					} else {
						draw.text( rc.incrX(5), record[$field], "left");
					}
					if( col )
						draw.rectLine( rc, 34, '#606062', 4);
					else
						draw.rectLine( rc, 134, '#606062', 4);
					if( record[@$field] ) {
						this.modifyMark(draw, rc);
					}
				}
			}
		case Status:
			draw.fill( cur[rect], '#606062');
			draw.rectLine( cur[rect], 134, '#606062', 4);
			/* 적용버튼 */
			rcBtn=cur[rcApply].center(123, 65);
			ty=when( rcBtn.eq(this.mouseDownRect), 'p', 'n');
			img=commonImage('btn_bg', ty);
			draw.drawImage(rcBtn, img );
			draw.font(16,'normal','#f0f0f0').text(rcBtn, "적용", "center");
			
			/* status */
			idx=sp+1, total=root.childCount();
			draw.font(14, 'normal', '#f0f0f0');
			draw.text( cur[rcStatus].incr(10), "$idx/$total" );
			/* navi */
			
			/* scroll up */
			if( sp>0 ) {
				var=when( this.mouseDownRect.eq(cur[rcUp]), 'p','n');
			} else {
				var='d';
			}
			imgUp=commonImage('btn_up',var);
			
			/* scroll down */
			if( ep<total ) {
				var=when( this.mouseDownRect.eq(cur[rcDown]), 'p','n');
			} else {
				var='d';
			}
			imgDown=commonImage('btn_down',var);
			draw.drawImage( imgUp.center(cur[rcUp]), imgUp);
			draw.drawImage( imgDown.center(cur[rcDown]), imgDown);
			
		default:
		}
	}
	if( this.tooltipRect ) {
		rc=this.tooltipRect, record=this.currentRecord, field=this.currentField;
		text=record[$field];
		draw.fill(rc,'#4f4f50').rectLine(rc.incrY(-2), 0, '#606062', 2);
		draw.font(14,'normal','#eaeaf0').text(rc.incrX(5), text);
	}
}

mouseDown(pos) {
	this.mouseDownRect=null; 
	header=null;
	while( cur, tag ) {
		switch( cur[tag] ) {
			case Header:
				header=cur;
			case Body:
			sp=this.startRow, ep=sp+this.listNum, root=this.dataNode;
			while( row, ep, sp ) {
				record=root.child(row);
				not( record ) {
					break;
				}
				if( record[rect].contains(pos) ) {
					while( sub, header, col, 0 ) {
						if( record[rect $col].contains(pos) ) {
							this.gridClick(record, sub[code], record[rect $col] );
						}
					}
					this.update();
					return;
				}
			}
		case Status:
			rcBtn=cur[rcApply].center(123, 65);
			if( rcBtn.contains(pos) ) {
				this.mouseDownRect=rcBtn;
				this.applyClick();
			} else if( cur[rcUp].contains(pos) ) {
				this.mouseDownRect=cur[rcUp];
				this.goPageUpDown('up');
			} else if( cur[rcDown].contains(pos) ) {
				this.mouseDownRect=cur[rcDown];
				this.goPageUpDown('down');
			}
		default:
		}
		if( this.mouseDownRect ) {
			this.update();
			return;
		}
	}
	if( this.tooltipRect ) {
		this.tooltipRect=null;
		this.update();
	}
}

mouseUp(pos) {
	if( this.mouseDownRect  ) {
		this.mouseDownRect=null;
		this.update();
	}
}

setModel(root, fields) {
	_header=func(node, &str) {
		node.removeAll();
		while( str.valid() ) {
			line=str.findPos(',');
			not( line.ch() ) continue;
			cur = node.addNode({tag:field});
			cur[code]=line.findPos(':').trim();
			cur[text]=line.findPos('#').trim();
			cur[width]=line.trim();
		}
	};
	_header( this.findTag('Header'), fields.ref() );
	this.startRow=0;
	this.dataNode=root;
	this.conf();
	this.update();
}

goPageUpDown(type) {
	sp=this.startRow, ep=sp+this.listNum, root=this.dataNode;
	total=root.childCount();
	switch(type) {
	case up:
		if( sp>0 ) {
			sp-=this.listNum;
			if( sp<0 ) sp=0;
			this.startRow=sp;
		} else {
			return;
		}
	case down:
		if( ep< total ) {
			this.startRow=ep;
		} else {
			return;
		}
	}
	this.confBody();
	this.update();
}

gridClick(record, field, rect) {
	if( this.tooltipRect ) {
		this.tooltipRect=null;
	}
	this.currentRecord=record;
	this.currentField=field;
	tw=textWidth(14, record[$field]), rw=rect.width()-5;
	if( tw > rw ) {
		dist=tw-rw;
		this.tooltipRect=rect.incrW(dist);
		this.update();
	}
	parentCtrl.gridClick(record, field);
}

applyClick() {
	parentCtrl.applyClick(this.dataNode, this );
}

modifyMark(draw, rc) {
	arr=_arr();
	x=rc.right()-10, y=rc.y();
	sp=Class.point(x,y);
	arr.add(sp);
	arr.add(rc.rt()); y+=8;
	arr.add(Class.point(rc.right(),y));
	arr.add(sp);
	draw.polygon(arr,'fill','#c05060');
}

test() {
	model=Class.model('GoodsInfo');
	root=model.rootNode();
	db=Class.db('kiosk_hitec');
	db.fetchAll( conf("sql#hitec.goodsInfo"), root.removeAll() );
	this.findControl('GridControl').setModel(root, "
		clplu_cd: 		코너명			#40,
		goods_cd: 		상품코드 		#25,
		goods_nm: 	상품명 			#45,
		uprice:			가격			 	#30,
		goods_img:	상품이미지		#30,
		start_time:		시작시간		#25,
		end_time:		종료시간		#25,
		sold_yn:		품절여부		#20
	");
	this.dataModel=model;
}

## 달력

Calendar(tag, parentCtrl) {
	parentCtrl.inject(db, cf, xmlNode);
	this.addClass('common/control.PageBase');
	this.initControl();
}

initControl() {
	not( tag[type] ) tag[type]='vbox';
	tag.removeAll();
	tag.addNode({tag: YearLabel});
	tag.addNode({tag: MonthLabel});
	tag.addNode({tag: PrevButton});
	tag.addNode({tag: NextButton});
	tag.addNode({tag: Days});
	commonImage('calendar_bg').imageSize().inject(w,h);
	tag[Width]=w, tag[Height]=h;
	tag[rect]=null;
	setNodeSize(tag, true);
}

conf() {
	offset=tag[rect].lt();
	offset.inject(ox, oy);
	while( cur, tag ) {
		switch(cur[tag] ) {
		case YearLabel:		cur[rect]=Class.rect(157,18,212,75).move(offset, true);
		case MonthLabel:	cur[rect]=Class.rect(421,18,100,75).move(offset, true);
		case PrevButton:
			cur[rect]=Class.rect(25,18,83,75).move(offset, true);
		case NextButton:
			cur[rect]=Class.rect(631,18,83,75).move(offset, true);
		case Days:
			sx=2, sy=155, sw=105, sh=94;
			sx+=ox, sy+=oy;
			while( row, 6 ) {
				cx=sx;
				while( col, 7 ) {
					cur[rect $row $col]=Class.rect(cx, sy, sw, sh);
					cx+=sw;
				}
				sy+=sh;
			}
		}
	}
}

draw(draw, tm) {
	drawNodeStyle(draw, tag);
	not( tag[Year] ) tag[Year]=System.date('yyyy');
	not( tag[Month] ) tag[Month]=System.date('MM');
	draw.drawImage(tag[rect], commonImage('calendar_bg') );
	while( cur, tag ) {
		switch(cur[tag] ) {
		case YearLabel:
			drawNodeText( draw, cur[rect],"$tag[Year] 년" , 'right', 26, '#f0f0f0');
		case MonthLabel:
			drawNodeText( draw, cur[rect],"$tag[Month] 월" , 'left', 26, '#f0f0f0');
		case PrevButton:
			var=when( cur[rect].eq(this.mouseDownRect), 'p', 'n');
			draw.drawImage(cur[rect], commonImage('btn_prev',var) );
		case NextButton:
				var=when( cur[rect].eq(this.mouseDownRect), 'p', 'n');
			draw.drawImage(cur[rect], commonImage('btn_next',var) );
		case Days:
			year=tag[Year];
			if( tag[Month]<10 ) {
				month="0$tag[Month]";
			} else {
				month=tag[Month];
			}
			tm			=System.localtime("${year}-${month}-01" );
			days		=System.date(tm,'daysInMonth');
			day		=System.date(tm,'dayOfWeek');
			if( day.eq(7) ) day=0;
			
			m1="$tag[Year]-$tag[Month]", m2=System.date('yyyy-MM');
			curMonth = when( m1.eq(m2), true );
			dd=System.date('dd');
			dayNum=1;
			
			while( row, 6 ) {
				while( col, 7, day ) {
					rc=cur[rect $row $col];
					if( curMonth && dayNum.eq(dd) ) {
						draw.fill(rc.incr(1), '#c0a0aa');
					}
					switch( col ) {
					case 0:	color='#fa707a';
					case 6:	color='#7070fa';
					default: 	color='#70707a';
					}
					drawNodeText( draw, rc, dayNum , 'center', 18, color);
					if( dayNum.eq(days) ) {
						break;
					}
					dayNum+=1;
				}
				day=0;
				if( dayNum.eq(days) ) break;
			}
		default:
		}
	}
}

mouseDown(pos) {
	tag[SelectType]=null;
	while( cur, tag ) {
		switch(cur[tag] ) {
		case YearLabel:		 tag[SelectType]='year';
		case MonthLabel:	 tag[SelectType]='month';
		case PrevButton:
			not( cur[rect].contains(pos) ) continue;
			month=tag[Month];
			month-=1;
			if( month<1 ) {
				tag[Month]=12;
			} else {
				tag[Month]=month;
			}
			this.mouseDownRect=cur[rect];
		case NextButton:
			not( cur[rect].contains(pos) ) continue;
			month=tag[Month];
			month+=1;
			if( month>12 ) {
				tag[Month]=1;
			} else {
				tag[Month]=month;
			}
			this.mouseDownRect=cur[rect];
		case Days:
			year=tag[Year];
			if( tag[Month]<10 ) {
				month="0$tag[Month]";
			} else {
				month=tag[Month];
			}
			tm			=System.localtime("${year}-${month}-01" );
			days		=System.date(tm,'daysInMonth');
			day		=System.date(tm,'dayOfWeek');
			if( day.eq(7) ) day=0;
			dayNum=1;
			while( row, 6 ) {
				while( col, 7, day ) {
					rc=cur[rect $row $col];
					if( rc.contains(pos) ) {
						this.setDateSelect(year, month, dayNum);
						return;
					}
					if( dayNum.eq(days) ) {
						break;
					}
					dayNum+=1;
				}
				day=0;
				if( dayNum.eq(days) ) {
					break;
				}
			}
		default:
		}
	}
	if( this.mouseDownRect ) {
		this.update();
	}
}

mouseUp(pos) {
	if( this.mouseDownRect ) {
		this.mouseDownRect=null;
		this.update();
	}
}

test() {
	this.initControl();
	this.conf();
}

setDateSelect(year, month, day) {
	not( year ) return;
	ctrl=tag[openerControl];
	if( ctrl ) {
		dd=lpad(day,2);
		ctrl.setCalendarDate("$year-$month-$dd");
	}
	parentCtrl.popupClose();
}

## 공통 팝업

CommCombo(tag, parentCtrl) {
	parentCtrl.inject(db, cf, xmlNode);
	this.addClass('common/control.PageBase');
	this.initControl();
}

initControl() {
	not( tag[type] ) tag[type]='vbox';
	setNodeSize(tag, true);
	tag.removeAll();
	tag.addNode({tag: TopTitle});
	tag.addNode({tag: Body});
	tag.addNode({tag: Status});
}

conf() {
	cf.inject(imagePath);
	tag[rect].inject(sx, sy, sw, sh);
	cw=tag[ContentWidth];						not( cw ) cw=600;
	sw=cw+60;
	
	_setCodeData=func(node, cur) {
		not( node ) {
			return;
		}
		cell=nvl( tag[CellCount], 3 );
		cur[rect 2].inject(x,y,w,h);
		wa=_arr(tag,'WidthArray').recalc(w, cell );
		
		idx=0, cy=y+25, ch=60;
		while( row, 5 ) {
			cx=x;
			while( cw, wa, col, 0 ) {
				sub=node.child(idx), idx++;
				not( sub ) {
					break;
				}
				sub[rect]=Class.rect(cx,cy,cw,ch), cx+=cw;
			}
			cy+=ch;
		}
	};
	while( cur, tag ) {
		switch(cur[tag]) {
		case TopTitle:
			cx=sx, sh=99;
			cur[rect 1]=Class.rect(cx,sy,30,sh), 	cx+=30;
			cur[rect 2]=Class.rect(cx,sy,cw,sh), 	cx+=cw;
			cur[rect 3]=Class.rect(cx,sy,30,sh);
		case Body:
			cx=sx, sh=tag[ContentHeight];		not( sh ) sh=450;
			cur[rect 1]=Class.rect(cx,sy,30,sh), 	cx+=30;
			cur[rect 2]=Class.rect(cx,sy,cw,sh), 	cx+=cw;
			cur[rect 3]=Class.rect(cx,sy,30,sh);
			_setCodeData( tag[CodeNode], cur );
		case Status:
			cx=sx, sh=40;
			cur[rect 1]=Class.rect(cx,sy,30,sh), 	cx+=30;
			cur[rect 2]=Class.rect(cx,sy,cw,sh), 	cx+=cw;
			cur[rect 3]=Class.rect(cx,sy,30,sh);
		}
		cur[rect]=Class.rect(sx, sy, sw, sh),	sy+=sh;
	}
}

draw(draw, timeline) {
	setDrawOpacity(draw, timeline);
	drawNodeStyle(draw, tag);
	while( cur, tag ) {
		switch(cur[tag]) {
		case TopTitle:
			while( col, 3 ) {
				idx=col+1;
				draw.drawImage(cur[rect $idx], commonImage("popup_box1$idx") );
			}
			drawNodeText(draw, cur[rect 2], tag[CodeText], 'left', 32, '#f0f0f0');
		case Body:
			while( col, 3 ) {
				idx=col+1;
				draw.drawImage(cur[rect $idx], commonImage("popup_box2$idx") );
			}
			draw.save().font(15,'normal','#404040');
			while( sub, tag[CodeNode] ) {
				rc=sub[rect];
				rcIcon=rc.width(38).center(28,28);
				rc.incrX(38);
				imgId=when( sub[checked], "radio_on", "radio_off");
				draw.drawImage(rcIcon, commonImage(imgId) );
				draw.text(rc, sub[value]);
				
				not( sub[textWidth] ) {
					sub[textWidth]=draw.textWidth(sub[value]) + 38;
				}
			}
			draw.restore();
		case Status:
			while( col, 3 ) {
				idx=col+1;
				draw.drawImage(cur[rect $idx], commonImage("popup_box3$idx") );
			}
		}
	}
	if( this.mouseOverNode ) {
		node=this.mouseOverNode;
		rc=node[rect].incrX(38).width(node[textWidth] );
		draw.fill(rc,'#d0d0d0').rectLine(rc, 0, '#c0c0c0');
		draw.font(15,'normal','#606090').text(rc.incrX(4), node[value]);
	}
}

mouseDown(pos) {
	this.mouseOverNode=null;
	while( sub, tag[CodeNode] ) {
		if( sub[rect].contains(pos) ) {
			ctrl=tag[openerControl];
			if( ctrl ) {
				if( sub[code].eq('00') ) {
					sub[code]='';
				}
				ctrl.setCommCode(sub);
				cf[popupCloseCheck]=true;
			}
			sub[checked]=true;
		} else {
			sub[checked]=false;
		}
	}
	this.update();
}

mouseUp(pos) {
}

setCommCode(code, text, targetNode, cellCount, def) {
	node= when( typeof(code,'node'), code,  getCommCodeNode(code, def) );
	
	tag[CodeText]	= text;
	tag[CodeNode]	= node;
	tag[TargetNode]	= targetNode;
	tag[CellCount]	= nvl(cellCount,3);
	this.conf();
	this.update();
}

setOptionValue(code) {
	while( cur, tag[CodeNode] ) {
		if( cur[code].eq(code) ) {
			cur[checked]=true;
		} else {
			cur[checked]=false;
		}
	}
	this.update();
}

mouseMove(pos) {
	while( sub, tag[CodeNode] ) {
		if( sub[rect].contains(pos) ) {
			if( this.mouseOverNode==sub ) return;
			if( sub[rect].width() < sub[textWidth] ) {
				this.mouseOverNode=sub;
				this.update();
				return;
			}
		}
	}
	if( this.mouseOverNode ) {
		this.mouseOverNode=null;
		this.update();
	}
}

test() {
	loadCommonImage(cf);
	this.conf();
	this.update();
}


## 키보드
Keyboard(tag, parentCtrl) {
	parentCtrl.inject(db, cf, xmlNode);
	this.addClass('common/control.PageBase');
	this.initControl();
	automata=Cf.automata();
}

initControl() {
	cf.inject(imagePath);
	tag[bg]="$imagePath/tool/keyboard/keyborad_bg.png";
	img=imageLoad(tag,'bg');
	img.imageSize().inject(w,h);
	tag[Width]=w, tag[Height]=h;
	setNodeSize(tag);
	this.makeKeyMap('EngLower');
	this.makeKeyMap('EngUpper');
	this.makeKeyMap('KorLower');
	this.makeKeyMap('KorUpper');
	this.makeKeyMap('NumOper');
	this.langMode='kor';
	tag[keyMap]='KorLower';
}

conf() {
	ox=8, oy=8, bw=67, bh=60, gabX=6, gabY=7;
	tag[rect].inject(sx, sy);
	sy+=oy;
	while( n, 4 ) {
		switch(n) {
		case 0:
			cx=sx+ox;
			while( c, 10 ) {
				tag[rc $n $c]=Class.rect(cx,sy,bw,bh), cx+=bw+gabX;
			}
			c+=1, w=876-cx;
			if( w<60 ) w=110;
			tag[rc $n $c]=Class.rect(cx,sy,w,bh);
			sy+=bh+gabY;
		case 1:
			cx=sx+24;
			while( c, 10 ) {
				tag[rc $n $c] = Class.rect(cx,sy,bw,bh), cx+=bw+gabX;
			}
			c+=1, w=876-cx;
			if( w<60 ) w=110;
			tag[rc $n $c]=Class.rect(cx,sy,w,bh);
			sy+=bh+gabY;
		default:
			cx=sx+ox;
			while( c, 12 ) {
				tag[rc $n $c] = Class.rect(cx,sy,bw,bh), cx+=bw+gabX;
			}
			sy+=bh+gabY;
		 	if( n.eq(3) ) {
		 		r1=tag[rc $n 4], r2=tag[rc $n 7];
		 		tag[rcSpace]=mergeRect(r1,r2);
		 	}
		}
	}
}

draw(draw, tm) {
	kid=this[keyId];
	not( kid ) {
		kid=this[langMode].upper(1);
		if( this.flag("keyMode", KM.Shift) ) {
			kid.add("Upper");
		} else {
			kid.add("Lower");
		}
	}
	keyMap=this[key#$kid];
	draw.fill(tag[rect],'#1a1a1a');
	draw.font(14,'normal','#fafafa');
	
	keyText=func() {
		key=keyMap[k $n $c];
		switch(key) {
		case comma:	draw.text(rc,',' ,'center');
		case dot:			draw.text(rc, '.','center');
		case bs:
			img=commonImage('icon_bs');
			draw.drawImage( img.center(rc), img);
		case enter:
			img=commonImage('icon_enter');
			draw.drawImage( img.center(rc), img);
		case etc:
			img=commonImage('icon_etc');
			draw.drawImage( img.center(rc), img);
		default:
			draw.text(rc, key, 'center');
		}
	};
	while( n, 4 ) {
		switch(n) {
		case 0:
			while( c, 11 ) {
				rc=tag[rc $n $c];
				if( rc.eq(this.mouseDownRect) ) {
					rc.incr(-4);
					draw.fill(rc,'#80808a').rectLine(rc, 0, '#20202a');
				} else {
					draw.fill(rc,'#333333').rectLine(rc, 0, '#20202a');
				}
				keyText();
			}
		case 1:
			while( c, 11 ) {
				rc=tag[rc $n $c];
				if( rc.eq(this.mouseDownRect) ) {
					rc.incr(-2);
					draw.fill(rc,'#80808a').rectLine(rc, 0, '#20202a');
				} else {
					draw.fill(rc,'#333333').rectLine(rc, 0, '#20202a');
				}
				keyText();
			}
		case 2:
			while( c, 12 ) {
				rc=tag[rc $n $c];
				if( c.eq(0,11) ) {
					if( rc.eq(this.mouseDownRect) ) {
						draw.fill(rc,'#7a7070').rectLine(rc, 0, '#20202a');
					} else if( this.flag("keyMode",KM.ShiftOn) ) {
						draw.fill(rc,'#c06a7b').rectLine(rc, 0, '#d09ab0', 2);
					} else if( this.flag("keyMode",KM.Shift) ) {
						draw.fill(rc,'#9a9090').rectLine(rc, 0, '#20202a');
					} else {
							draw.fill(rc,'#4d4d4d').rectLine(rc, 0, '#20202a');
					}
					keyText();
				} else {
					if( rc.eq(this.mouseDownRect) ) {
						rc.incr(-4);
						draw.fill(rc,'#80808a').rectLine(rc, 0, '#20202a');
					} else {
						draw.fill(rc,'#333333').rectLine(rc, 0, '#20202a');
					}
					keyText();
				}
			}
		case 3:
			while( c, 12 ) {
				if( c.eq(4,5,6,7) ) {
					not( c.eq(4) ) continue;
					rc=tag[rcSpace];
					if( rc.eq(this.mouseDownRect) ) {
						rc.incr(-2);
						draw.fill(rc,'#80808a').rectLine(rc, 0, '#20202a');
					} else {
						draw.fill(rc,'#333333').rectLine(rc, 0, '#20202a');
					}
				} else {
					rc=tag[rc $n $c], def=true;
					if( c.eq(1) ) {
						 if( this.flag("keyMode",KM.Ctrl) ) {
							draw.fill(rc,'#9a9090').rectLine(rc, 0, '#20202a');
						} else {
							draw.fill(rc,'#4d4d4d').rectLine(rc, 0, '#20202a');
						}
						def=false;
					} else if( c.eq(8) ) {
						if( this[langMode].eq('kor') ) {
							draw.fill(rc,'#707a7a').rectLine(rc, 0, '#40404a');
							def=false;
						}
					}
					if( def ) {
						if( rc.eq(this.mouseDownRect) ) {
							draw.fill(rc,'#7a7070').rectLine(rc, 0, '#20202a');
						} else {
							draw.fill(rc,'#4d4d4d').rectLine(rc, 0, '#20202a');
						}
					}
					keyText();
				}
			}
		default:
		}
	}
}

mouseDown(pos) {
	update=func() {
		this.mouseDownRect=rc;
		this.update();
	};
	while( n, 4 ) {
		switch(n) {
		case 0:
			while( c, 11 ) {
				rc=tag[rc $n $c];
				not( rc.contains(pos) ) continue;
				return update();
			}
		case 1:
			while( c, 11 ) {
				rc=tag[rc $n $c];
				not( rc.contains(pos) ) continue;
				return update();
			}
		case 2:
			while( c, 12 ) {
				rc=tag[rc $n $c];
				not( rc.contains(pos) ) continue;
				return update();
			}
		case 3:
			while( c, 12 ) {
				if( c.eq(4,5,6,7) ) {
					not( c.eq(4) ) continue;
					rc=tag[rcSpace];
				} else {
					rc=tag[rc $n $c];
				}
				not( rc.contains(pos) ) continue;
				return update();
			}
		default:
		}
	}
}

mouseUp(pos) {
	update=func(rc) {
		if( this.mouseDownRect ) {
			this.mouseDownRect=null;
			this.update();
		}
		if( rc ) {
			this.keyDown(n,c);
		}
	};
	while( n, 4 ) {
		switch(n) {
		case 0:
			while( c, 11 ) {
				rc=tag[rc $n $c];
				not( rc.contains(pos) ) continue;
				return update(rc);
			}
		case 1:
			while( c, 11 ) {
				rc=tag[rc $n $c];
				not( rc.contains(pos) ) continue;
				return update(rc);
			}
		case 2:
			while( c, 12 ) {
				rc=tag[rc $n $c];
				not( rc.contains(pos) ) continue;
				return update(rc);
			}
		case 3:
			while( c, 12 ) {
				if( c.eq(4,5,6,7) ) {
					not( c.eq(4) ) continue;
					rc=tag[rcSpace];
				} else {
					rc=tag[rc $n $c];
				}
				not( rc.contains(pos) ) continue;
				return update(rc);
			}
		default:
		}
	}
	update();
}

makeKeyMap(code) {
	s=conf("data.key#$code").str();
	keys=_node(this,"key#$code", true);
	while( s.valid(), n, 0 ) {
		line=s.findPos("\n");
		while( line.valid(), c, 0 ) {
			keys[k $n $c]=line.findPos(",").trim();
		}
	}
}

keyDown(n,c) {
	this.inject(keyMode, langMode );
	kid=this[keyId];
	not( kid ) {
		kid=when( this.flag('keyMode',KM.Shift), 'EngUpper', 'EngLower');
	}
	keyMap=this[key#$kid];
	
	addMode=when( this[leftString], 'leftString','doneString');
	_value=func(val ) {
		switch( val ) {
		case enter: 		val="\n";
		case tab: 		val="\t";
		case dot:			val='.';
		case comma:	val=',';
		}
		if( langMode.eq('kor') ) {
			if( val.isAlpha() ) {
				this[ingString].add(val);
				automata.toString(this, addMode);
			} else {
				automata.toString(this, addMode);
				this[doneString].add(this[doingString]);
				this.clear();
				this[$addMode].add(val);
			}
		} else {
			automata.toString(this, addMode);
			this[$addMode].add(val);
		}
		this.setInputText(addMode);
		if( this.flag('keyMode',KM.Shift) ) {
			not( this.flag('keyMode',KM.ShiftOn) ) {
				this.flag('keyMode',KM.Shift, false);
			}
		}
		this.flag('keyMode',KM.Ctrl, false);
	};
	
	ing=this[ingString];
	switch(n ) {
	case 0:
		if( c.eq(10) ) {
			if( ing ) {
				if( ing.size().eq(1) ) {
					this.clear();
				} else {
					this[ingString]=ing.value(0,-1);
					automata.toString(this, addMode);
				}
			} else {
				if( this.flag('keyMode',KM.Ctrl) ) {
					this[$addMode]='';
					this.flag('keyMode',KM.Ctrl, false);
				} else {
					str=this[$addMode];
					this[$addMode]=str.substr(0,-1);
				}
			}
			this.setInputText(addMode);
		} else {
			_value( keyMap[k $n $c] );
		}
	case 1:
		if( c.eq(10) ) {
			_value("\n");
		} else {
			_value( keyMap[k $n $c] );
		}
	case 2:
		if( c.eq(0,11) ) {
			if( this.flag('keyMode',KM.ShiftOn) ) {
				this.flag('keyMode',KM.Shift, false);
				this.flag('keyMode',KM.ShiftOn, false);
			} else if( this.flag('keyMode',KM.Shift) ) {
				this.flag('keyMode',KM.ShiftOn, true);
			} else {
				this.flag('keyMode',KM.Shift, true);
			}
		} else {
			_value( keyMap[k $n $c] );
		}
	case 3:
		switch( c) {
		case 0:
			if( this[keyId].eq('NumOper') ) {
				this[keyId]=null;
			} else {
				this[keyId]='NumOper';
			}
		case 1:
			flag=when( this.flag('keyMode',KM.Ctrl), false, true);
			this.flag('keyMode',KM.Ctrl, flag);
		case 3:	_value( "\t" );
		case 4:	_value( " " );
		case 8:
			if( this[langMode].eq('kor') ) {
				this[langMode]='eng';
			} else {
				this[langMode]='kor';
			}
		case 11:
			this[$addMode]='';
			this.setInputText(addMode);
		default:
			_value( keyMap[k $n $c] );
		}
	default:
	}
	this.update();
}

setString(str, type, pos) {
	len=str.length(), ok=false;
	if( isset(pos) ) {
		if( pos<len ) {
			ok=true;
		}
	}
	this.clear();
	if( type ) {
		this.flag('keyMode',KM.Shift, false);
		this.flag('keyMode',KM.ShiftOn, false);
		this[keyId]=null;
		switch( type ) {
		case num:
			this[keyId]='NumOper';
		case upper:
			this[langMode]='eng';
			this.flag('keyMode',KM.Shift, true);
			this.flag('keyMode',KM.ShiftOn, true);
		default:
			this[langMode]='eng';
		}
	}
	if( ok ) {
		this[leftString]=str.substr(0,pos), this[rightString]=str.substr(pos);
		this[doneString]='';
	} else {
		this[leftString]='', this[rightString]='';
		this[doneString]=str;
	}
}

setInputText(addMode) {
	input = cf[inputNode];
	not( input ) {
		this.clear();
	}
	str='';
	str.add(this[$addMode], this[doingString]);
	if( addMode.eq('leftString') ) {
		str.add(this[rightString]);
	}
	print(ing, this[doingString] );
	input[text]=str;
}

clear() {
	automata.clear();
	this[doingString]='';
	this[ingString]='';
}

/*
##> data.key#EngLower = q,w,e,r,t,y,u,i,o,p,bs
a,s,d,f,g,h,j,k,l,',enter
shift,z,x,c,v,b,n,m,comma,dot,/,shift
&123,Ctrl,etc,tab,space,-,-,-,Eng,<,>,ESC



##> data.key#EngUpper = Q,W,E,R,T,Y,U,I,O,P,bs
A,S,D,F,G,H,J,K,L,",enter
shift,Z,X,C,V,B,N,M,comma,dot,/,shift
&123,Ctrl,etc,tab,space,-,-,-,Eng,<,>,ESC



##> data.key#KorUpper = ㅃ,ㅉ,ㄸ,ㄲ,ㅆ,ㅛ,ㅕ,ㅑ,ㅐ,ㅔ,bs
ㅁ,ㄴ,ㅇ,ㄹ,ㅎ,ㅗ,ㅓ,ㅏ,ㅣ,",enter
shift,ㅋ,ㅌ,ㅊ,ㅍ,ㅠ,ㅜ,ㅡ,comma,dot,/,shift
&123,Ctrl,etc,tab,space,-,-,-,Kor,<,>,ESC



##> data.key#KorLower = ㅂ,ㅈ,ㄷ,ㄱ,ㅅ,ㅛ,ㅕ,ㅑ,ㅐ,ㅔ,bs
ㅁ,ㄴ,ㅇ,ㄹ,ㅎ,ㅗ,ㅓ,ㅏ,ㅣ,',enter
shift,ㅋ,ㅌ,ㅊ,ㅍ,ㅠ,ㅜ,ㅡ,comma,dot,/,shift
&123,Ctrl,etc,tab,space,-,-,-,Kor,<,>,ESC

##> data.key#NumOper = 1,2,3,4,5,6,7,8,9,0,bs
!,@,#,$,%,^,&,*,(,),enter
◀,~,-,+,_,\,|,:,;,/,?,▶
prev,Ctrl,etc,tab,space,-,-,-,fn,comma,dot,ESC

*/


## 숫자입력

NumberPad(tag, parentCtrl) {
	parentCtrl.inject(db, cf, xmlNode);
	this.addClass('common/control.PageBase');
	this.initControl();
}

initControl() {
	tag[Width]=452, tag[Height]=536;
	setNodeSize(tag, true);
}

conf() {
	cf.inject( imagePath);
	tag[rect].inject(sx, sy, sw, sh);
	bw=134, bh=119;
	sx+=15, sy+=15;
	num=1;
	imageLoad(tag, 'bg', "${imagePath}/main/common/bg_452x536.png");
	while( row,4 ) {
		cx=sx;
		while( col,3 ) {
			if( row.eq(3) ) {
				switch(col) {
				case 0:	img="login_num_00_[#].png";
				case 1:	img="login_num_del_[#].png";
				case 2:	img="login_num_re_[#].png";
				}
			} else {
				img="login_num_0${num}_[#].png";
				num++;
			}
			tag[rect#$row $col]=Class.rect(cx, sy, bw, bh), cx+=bw+10;
			tag[img#$row $col]="${imagePath}/admin/$img";
		}
		sy+=bh+10;
	}
	printNode(tag);
}

draw(draw, tm) {
	draw.drawImage( tag[rect], imageLoad(tag, 'bg') );
	while( row,4 ) {
		while( col,3 ) {
			rc=tag[rect#$row $col];
			var=when( rc.eq(this.mouseDownRect), 'p', 'n');
			img=imageLoad(tag, "img#$row $col", var);
			draw.drawImage(rc, img);
		}
	}
}

mouseDown(pos) {
	while( row,4 ) {
		while( col,3 ) {
			not( tag[rect#$row $col].contains(pos) ) continue;
			this.mouseDownRect=tag[rect#$row $col];
			this.buttonClick(row, col);
			break;
		}
	}
	if( this.mouseDownRect ) {
		this.update();
	}
}

mouseUp(pos) {
	if( this.mouseDownRect ) {
		this.mouseDownRect=null;
		this.update();
	}
}

buttonClick(row, col) {
	val=null;
	if( row.eq(3) ) {
		switch(col) {
		case 0:	val='0';
		case 1:	val='delete';
		case 2:	val='reset'
		}
	} else {
		row*=3, row+=col;
		row+=1;
		val=row;
	}
	ctrl=tag[openerControl];
	if( ctrl ) {
		input=ctrl.currentInput;
		if( input ) {
			this.setInputText(input, val);
		} else {
			ctrl.setNumberPadValue(val);
		}
	}
}

setInputText(input, num) {
	text=input[text];
	not( text ) text='';
	if( num.eq('0') ) {
		text.add('0');
		input[text]=text;
	} else if( num.eq('delete') ) {
			input[text]=text.value(0,-1);
	} else if( num.eq('reset') ) {
		input[text]='';
	} else {
			text.add(num);
		input[text]=text;
	}
}

## 텍스트 입력폼
InputTextForm(tag, parentCtrl) {
	parentCtrl.inject(db, cf, xmlNode);
	this.addClass('common/control.PageBase');
	this.initControl();
}

initControl() {
	tag.removeAll();
	tag.addNode({tag: Title, Height:99});
	tag.addNode({tag: Body});
	tag.addNode({tag: Status, Height:40});
	body=this.findTag('Body');
	body.addNode({tag: Form});
	body.addNode({tag: Keyboard, ClassPath:common, Height:276});
}

conf() {
	while( cur, tagRect(tag,true) ) {
		rectRateArray(cur[rect],'30,*,30').inject( rc0, rc1, rc2);
		cur.put( rc0, rc1, rc2);
	}
	body=this.findTag('Body');
	while( cur, tagRect(body) ) {
		switch(cur[tag]) {
		case Form:
		case Keyboard: this.getControl(cur).conf();
		}
	}
}

draw(draw, timeline) {
	this.drawFadeIn(draw, timeline);	
	while( cur, tag ) {
		switch(cur[tag]) {
		case Title:
			while( col, 3 ) {
				idx=col+1;
				draw.drawImage(cur[rc$col], commonImage("popup_box1$idx") );
			}
			drawNodeText(draw, cur[rc1], tag[title], 'left', 32, '#f0f0f0');
		case Body:
			while( col, 3 ) {
				idx=col+1;
				draw.drawImage(cur[rc$col], commonImage("popup_box2$idx") );
			}
		case Status:
			while( col, 3 ) {
				idx=col+1;
				draw.drawImage(cur[rc$col], commonImage("popup_box3$idx") );
			}
		}
	}
	while( cur, this.findTag('Body') ) {
		switch(cur[tag]) {
		case Form:
			input=cur.child(0);
			draw.font(14,'bold', '#80808a').text( input[rectLabel], "$input[label] : " );
			rc=input[rect].incr(-4);
			draw.rectLine(rc, 0, '#30303a');
			draw.font(14,'bold', '#40404a').text( input[rect], input[text] );
			
			rc=input[rcApply];
			ty=when( rc.eq(this.mouseDownRect), 'p', 'n');
			draw.drawImage(rc, commonImage('btn_bg', ty) );
			draw.font(16,'normai','#f0f0f0').text(rc, "적용", "center" );
			
		case Keyboard: this.getControl(cur).draw(draw, timeline);
		}
	}
}

mouseDown(pos) {
	while( cur, this.findTag('Body') ) {
		switch(cur[tag]) {
		case Form:
			input=cur.child(0);
			if( input[rcApply].contains(pos) ) {
				this.mouseDownRect=input[rcApply];
				this.applyClick(input);
				this.update();
				return;
			}
		case Keyboard: this.getControl(cur).mouseDown(pos);
		}
	}
}

mouseUp(pos) {
	while( cur, this.findTag('Body') ) {
		switch(cur[tag]) {
		case Form:
		case Keyboard: this.getControl(cur).mouseUp(pos);
		}
	}
	if( this.mouseDownRect ) {
		this.mouseDownRect=null;
		this.update();
	}
}

drawFadeIn(draw, timeline) {
	popupFadeIn(draw, timeline);	
}

setForm(record, field, label, title, type) {
	form=this.findTag('Form');
	rcForm=rectVCenter( form[rect].incr(10), 65, 10 );
	
	cur=form.child(0);
	not( cur ) {
		cur=form.addNode();
	}
	tag[title]=title;
	
	labelWidth= textWidth(14, "$label : ")+5;
	rectRateArray( rcForm, "$labelWidth,$400,15,123,*").inject(rcLabel, rcInput, space, rcApply);
	cur.put(record, field, label);
	cur[text]			= record[$field];
	cur[rect]			= rectVCenter(rcInput,30);
	cur[rectLabel]	= rectVCenter(rcLabel,30);
	cur[rcApply]		= rcApply;
	this.update();
	this.mainControl().setInputNode(cur);
	
	xx=this.findControl('Keyboard');
	this.findControl('Keyboard').setString(cur[text], type);
}

applyClick(input) {
	rec=input[record], field=input[field];
	prev=rec[$field];
	not( prev.eq(input[text]) ) {
		rec[$field]=input[text];
		rec[@$field]=true;
		rec.state(NODE.modify, true);
	}
	this.findControl('Popup#dialog').popupClose();
}

