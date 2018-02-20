## 클래스 수정내용이 출력
CreateClassEditor :: initPage

	[ 수정내용 ] 
	this.setSrc(src); ==>this.setSrc(node[src]);


## 클래스 저장 로직수정
page=get('PageEdit.KioskHiTecDrawClassTree');

createClassOk(type, editNode) {
	tag=editNode.tag;
	pageCode=getParentObject(this, 'currentPageNode').get('page_code');
	not( pageCode ) {
		this.alert("페이지 코드가 존재하지 않습니다. 생성 클래스를 확인하세요");
		return;
	}
	path=editNode[ClassPath];
	if( path ) {
		classId="$path/control.$tag";
	} else {
		classId="KioskHiTec/$pageCode/control.$tag";
	}
	err=saveClassNode(classId, editNode[src].ref() );
	if( err ) {
		this.alert("페이지 저장중 오류가 발생했습니다\n에러내용: $err");
		return;
	}
	p=editNode.parent();
	not( p ) return;
	pctrl=p[@control];
	not( pctrl ) {
		pctrl=DrawClass;
	}
	editNode[@control]=newClass(classId, editNode, pctrl);
	DrawClass.conf();
	this.tree.update();
}

## canvas 이벤트 stackPage 처리

/*    캔버스 드로우 이벤트     */
canvasDraw(draw) {
	tm=getDrawTimeline( timelineNode );
	if( cf[stackPage] ) {
		cf[stackPage].draw(draw, tm);
		if( cf[popupControl] ) {
			cf[popupControl].draw(draw,tm);
		} 		
	} else {
		if( cf[popupControl] ) {
			this.draw(draw);
			cf[popupControl].draw(draw,tm);
		} else {
			this.draw(draw, tm);
		}
	}
	if( cf[selectedItem] ) {
		rc=cf.selectedItem.rect;
		draw.rectLine(rc.incr(1), 0, '#afa0ea',3);
	}
	if( cf[mouseDownAction] ) {
		draw.save().pen('#cab0e9', 4);
		draw.polyLine(cf[mouseActionPoints]);
		draw.restore();
	}
}

/*    캔바스 마우스 다운이벤트    */
canvasMouseDown(pos) {
	while( rc, cf[ActionRects] ) {
		if( rc.contains(pos) ) {
			_arr(cf,'mouseActionPoints').reuse();
			cf[mouseDownAction]=true;
		}
	}
	if( cf[stackPage] ) {
		if( cf[popupControl] ) {
			cf[popupControl].mouseDown(pos);
		}  else {
			cf[stackPage].mouseDown(pos);
		}
		return;
	} else if( cf[popupControl] ) {
		cf[popupControl].mouseDown(pos);
		return;
	}
	this.mouseDown(pos);
}

/*    캔바스 마우스 업이벤트    */
canvasMouseMove(pos) {
	if( cf[mouseDownAction] ) {
		cf[mouseActionPoints].add(pos);
		this.update();
	}
	this.mouseMove(pos);
}

canvasMouseUp(pos) {
	if( cf[mouseDownAction] && canvasMouseAction(this) ) {
		return;
	}
	if( cf[stackPage] ) {
		if( cf[popupControl] ) {
			cf[popupControl].mouseUp(pos);
		}  else {
			cf[stackPage].mouseUp(pos);
		}
		return;
	} else if( cf[popupControl] ) {
		cf[popupControl].mouseUp(pos);
		return;
	}
	this.mouseUp(pos);
}



