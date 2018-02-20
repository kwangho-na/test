## Config

Config(page) {
	cf={};
	xmlNode={};
}

loadXml(fileName, root) {
	cf.inject(imagePath);
	not( root ) root=xmlNode;
	xml=fmt( fileRead(fileName) );
	this.parseXml(&xml, root.removeAll() );
}

parseProp(node, tag, &prop) {
	node[tag]=tag;
	while( prop.valid() ) {
		k=prop.findPos('=').trim();
		not( k ) break;
		ch=prop.ch();
		if( ch.eq() ) {
			node[$k]=prop.match();
		} else if( ch.eq('[') ) {
			in=prop.match().trim(), val="[$in]";
			node[$k]=val.split('parse');
		} else {
			node[$k]=prop.findPos(" \t\n",4).trim();
		}
	}
}

parseXml(&data, node) {
	not( node ) {
	not( node ) {
		node=xmlNode;
		node.removeAll();
	}
	while( data.valid() ) {
		ch=data.ch();
		not( ch.eq('<') ) {
			break;
		}
		if( data.ch(1).eq('!') ) {
			data.match('<!--','-->');
			continue;
		}
		sp=data.cur();
		tag=data.incr().move();
		sub = node.addNode();
		not( fiistNode ) {
			fiistNode=sub;
		}
		if( data.ch().eq(':') ) {
			sub[kind]=data.incr().move();
			print("tag--->$tag, $kind");
		}
		if( tag.eq('br', 'space', 'image') ) {
			prop=data.findPos(">");
			this.parseProp( sub, tag, prop);
		} else {
			in=data.find('>');
			if( in.ch(-1).eq('/') ) {
				prop=data.findPos('/>');
				this.parseProp( sub, tag, prop);
			} else {
				data.pos(sp);
				if( sub[kind] ) {
					in=data.match("<$tag:$sub[kind]","</$tag:$sub[kind]>");
				} else {
					in=data.match("<$tag","</$tag>",8);
				}
				not( in ) {
					print("@@ xml parse $tag not match");
					in=data.findPos("</$tag>");
				}
				prop=in.findPos(">");
				this.parseProp( sub, tag, prop);
				if( tag.eq('html', 'text') ) {
					val=in.trim();
					if( val ) sub[data]=val;
				} else {
					if( in.ch().eq('<') ) {
						this.parseXml(in, sub, fiistNode);
					} else {
						val=in.trim();
						if( val ) sub[data]=val;
					}
				}
			}
		}
	}
	return fiistNode;
}



## ReportBase
ReportBase(page, canvas) {
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
		classId="common/control.$cid";
	}
	classErrorCheck=_node(cf, 'classErrorCheck');
	if( classErrorCheck[$classId] ) {
		return null;
	}
	include(classId);
	ctrl=newClass(classId, cur, this );
	not( ctrl ) {
		classErrorCheck[$classId]=true;
		_log("[error.getControl] $classId 클래스 불러오기 오류\n cotrolNode: $cur");
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

rate(x) {
	not( x ) return null;
	x*=cf.pageRate;
	return x;
}

update(flag) {
	not( canvas ) {
		p=this.mainControl();
		p.inject(canvas);
	}
	if( flag ) {
		this.conf();
	}
	canvas.redraw();
}

resize() {
	not( canvas.command('isScroll') ) {
		return;
	}
	
		if( cf[lastResizeTick]  ) {
		dist = System.tick() - cf[lastResizeTick];
		if( dist<50 ) {
			return;
		}
	}
	cf[lastResizeTick]=System.tick();
	
	sz=page.size(), csz=canvas.size();
	w=sz.width(), h=sz.height(), cw=csz.width(), ch=csz.height();
	h-=25;
	if( defaultWidth ) {
		minWidth=defaultWidth;
		minWidth*=0.75;
		if( w>defaultWidth ) {
			if( cw.eq(defaultWidth) ) return;
			cw=defaultWidth;
		} else if( w<minWidth ) {
			if( cw.eq(minWidth) ) return;
			cw=minWidth;
		} else {
			cw=w-5;
		}
	} else {
		cw=w-5;
	}
	if( canvas.command("vertical", "isShow") ) {
		cw-=30;
	}
	canvas.size(cw,max(h,ch));
}




## Report
Report(page, tag) {
	this.addClass('common/control.ReportBase');
	canvas=page.report;
	canvas.eventMap( onDraw, this.canvasDraw, 'draw');
	canvas.eventMap( onMouseDown, this.canvasMouseDown, 'pos');
	canvas.eventMap( onMouseUp, this.canvasMouseUp, 'pos');
	canvas.eventMap( onMouseMove, this.canvasMouseMove, 'pos');
	canvas.eventMap( onEvent, this.canvasEvent, 'type, node');
	
	canvas.timer( 1000, callback() {
		this.timeout();
	}, this);
	
	this[reportNode]=null;
	this.initControl();
}

initControl() {
	cf.pageType='canvas';
}

conf() {
	cf[posY]=0;
	root=this[reportNode];
	root[rect]=cf[canvasRect].incr(15);
	confReportSize(root, true);
	confReportLayout(root);
	while( cur, root ) {
		if( cur[tag].eq('Popup') ) continue;
		this.getControl(cur).conf();
	}
}

canvasDraw(draw) {
	rc=canvas.rect();
	not( cf[canvasRect].eq(rc) ) {
		cf[canvasRect]=rc;
		this.conf();
	}
	rc=draw.rect();
	draw.fill(rc, '#ffffff');
	while( cur, this[reportNode] ) {
		if( cur[tag].eq('Popup') ) continue;
		this.getControl(cur).draw(draw);
	}
	if( Cf[currentTreeNode] ) {
		node=Cf[currentTreeNode];
		if( node[rcDraw] || node[rect] ) {
			rc=nvl(node[rcDraw], node[rect]);
			draw.rectLine(rc, 0, '#a0ba909a', 4);
		}
	}
}

canvasMouseDown(pos) {
	while( cur, this[reportNode] ) {
		if( cur[tag].eq('Popup') ) continue;
		this.getControl(cur).mouseDown(pos);
	}
}

canvasMouseMove(pos) {
	while( cur, this[reportNode] ) {
		if( cur[tag].eq('Popup') ) continue;
		this.getControl(cur).mouseMove(pos);
	}
}

canvasMouseUp(pos) {
	while( cur, this[reportNode] ) {
		if( cur[tag].eq('Popup') ) continue;
		this.getControl(cur).mouseUp(pos);
	}
}

setReport(reportXml) {
	node = this.parseXml( fmt(reportXml), tag.removeAll() );
	this[reportNode]=node;
	this.conf();
	this.update();
}

timeout() {
}

resize() {
	not( canvas.command('isScroll') ) {
		return;
	}
	
	if( cf[lastResizeTick] ) {
		dist = System.tick() - cf[lastResizeTick];
		if( dist<50 ) {
			print("resize skip ========$dist");
			return;
		}
	}
	cf[lastResizeTick]=System.tick();
	
	sz=page.size(), csz=canvas.size();
	w=sz.width(), h=sz.height(), cw=csz.width(), ch=csz.height();
	h-=25;
	if( cf[defaultWidth] ) {
		minWidth=cf[defaultWidth];
		minWidth*=0.75;
		if( w>cf[defaultWidth] ) {
			if( cw.eq(cf[defaultWidth]) ) return;
			cw=defaultWidth;
		} else if( w<minWidth ) {
			if( cw.eq(minWidth) ) return;
			cw=minWidth;
		} else {
			cw=w-5;
		}
	} else {
		cw=w-5;
	}
	if( canvas.command("vertical", "isShow") ) {
		cw-=30;
	}
	
	canvas.size(cw,max(h,ch));
}

##
setReportPage(node) {
	page=this.setReport(node);
	report=findTag('report', this);
	not( report ) {
		include('common/control.Report');
		include('common/control.ReportBase');
		cur=this.addNode({tag:report});
		class=newClass('common/control.Report', page, cur);
		cur[classObject]=class;
		page.setReportClass(class);
	}
}

report.setReport( data.ref() );

##
 

<report>
	<box id=title height=60 padding=[15,20] font=[18,bold] align=center>
		1. 육상 참가 신청서
	</box>
	<table height=85 rate=[4,7,4,7,3,6]>
		<row leftAligns=[3]>
			<label>시/군명</label><text>${dataNode[cityName]}</text>
			<label>종별</label><text colspan=3>${dataNode[divisionName]}</text> 
		</row>
		<row>
			<label>감독</label><input next=hp1>${dataNode[name1]}</input>
			<label>주무</label><input next=hp2>${dataNode[name2]}</input>
			<label>코치</label><input next=hp3>${dataNode[name3]}</input>
		</row>
		<row>
			<blank/><input>${dataNode[hp1]}</input>
			<blank/><input>${dataNode[hp2]}</input>
			<blank/><input>${dataNode[hp3]}</input>
		</row>
	</table>
	<box id=title height=40 padding=[20,0] font=[14,bold] align=center>
		${dataNode[disciplineName]} 참가선수 명단
	</box>
	<grid fields=[num, given_nm, birth_date, address, event1, event2, #401, #404, note]
			wraps=[address]
			inputs=[1,2,3,4,5,6,7,8]
			rate=[2,6,9,10,[4,4,4,4],8]
	>
		<header>번호, 성명, 주민등록번호\n(앞번호와 성별만 표기), 주소, 세부종목, 비고</header>
		<header rate=2.2>첫 번째\n(직접표기), 두 번째\n(직접표기), 400MR\n(ㅇ 표기), 1600MR\n(ㅇ 표기)</header>
	</grid>
	<text rate=true html=true>
		※ 작성요령 :	 <sep>
			(1) 1명 2종목, 1종목 2명 이내에 한함. <font color="blue"> (단, 릴레이 제외)</font>
			(2) 계주는 6명 이내에 한 함.
			<font color="blue">(3) 10㎞마라톤 출전선수 참가자격</font>
			<font color="blue"> (10㎞는 1961년 만 55세 이하의 출생자)</font>
	</text>
	<box height=50 rate=[4,5,5,4] font=[15,bold] padding=[20,40]>
		<text align="right">경기도 체육회</text>
		<text align="center">  ${dataNode[cityName]} </text>
		<text align="right">지부장</text>
		<text align="right">직인</text>
	</box>
	<box type=footer height=75 font=[18,bold]>
		<text width=20></text>
		<text align="left">경기도 체육회장        귀하</text>
	</box>
</report>


##
box(tag, parentCtrl) {
	parentCtrl.inject(db, cf, xmlNode);
	this.addClass('common/control.ReportBase');
}

conf() {
}
draw(draw, timeline) {
	draw.rectLine(tag[rect], 0, '#c0c0c0');
}

mouseDown(pos) {
}

mouseUp(pos) {
}

mouseMove(pos) {
}