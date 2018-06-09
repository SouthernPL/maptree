	// 遍历权限树每一层是一个level，逐渐递加，
	// 每个级别创建一个数组，并将同一级别的信息（对象）添加到这个这个数组中
	// 最终这些多个level数组可以用作数据源映射到视图中
	// 权限树的第一次遍历会自动生成此权限树中的唯一ID
	// 每次在视图中点击信息对象会获取它的唯一ID
	// 当点击其中一个信息对象时,会根据它携带的唯一ID,利用这个唯一ID传入遍历数组的函数中
	// 向上向下查找父子关系然后刷新此前的多个level数组
	// 这多个level数组会动态刷新映射到视图上
	function factoryTree(treeArr,nowId){
		
		var levelObject={};
		var levelNum=0;
		var lonely=0;//这是一个特殊情况下才会用到的计步器
		var infoId='';
		var lonelyObject={};//这是一个遗传计步器对象容器
		function mapTree(arr,parentKey){

			levelNum++;
			infoId+=parentKey;

			arr.map(function(val,key,myArr){
				// console.log(val.name,key)
				if(levelObject[levelNum]==undefined){
					levelObject[levelNum]=[];
				}
				
				var myId=infoId+key;
				val.myId=myId;

				var endFlag = key==myArr.length-1&&levelNum>2?true:false;

				if(!!nowId&&levelNum<=nowId.length){//传入了查询ID并且此刻的循环level处于查询ID的父级等级
					var id=nowId.slice(0,levelNum);
					if(id==myId){//id匹配则是当前查询ID的父亲
						levelObject[levelNum].push(val);
					}
				}else if(!!nowId&&levelNum>nowId.length){
					//查询传入ID的儿子时，需要将所有”儿子“的Id与自己的Id做比对，确认时遗传了自身Id的“亲儿子”
					var checkId=myId.slice(0,nowId.length);
					if(checkId==nowId){//id匹配则是当前查询ID的“亲儿子”
						levelObject[levelNum].push(val);
					}
				}else{
					levelObject[levelNum].push(val);

				}

				if(val.son.length==0&&key==myArr.length-1){
	
					var checkHaveLonely = false;

					for ( var k in lonelyObject){
						if(k==myId){
							checkHaveLonely=true;

						}
					}

					if(checkHaveLonely){
						var lonelyStep=lonelyObject[myId];
						levelNum=levelNum-lonelyStep-1;
						var upStep=1+lonelyStep;
						infoId=infoId.slice(0,-upStep);
						// console.log('lonely---------',val.name,lonelyObject)
						delete lonelyObject[myId];
					}else{
						levelNum--;
						infoId=infoId.slice(0,-1);
					}
	
				}else if(val.son.length>0&&key==myArr.length-1){
					//当元素是数组兄弟中的最后一个并且子级不是空的时候需要判断它是否需要记录累计值
					if(endFlag){
						// console.log('lonely++',val.name)
						lonely++;
						var lonelyFlag=false;
						//利用身份ID进行计步遗传的记录
						for (var i in lonelyObject){
							
							if(i==myId){
								lonelyFlag=true;
							}
						};
						if(lonelyFlag){
							
							var newNum = lonelyObject[myId]+1;
							var newLonelyId=myId+(val.son.length-1);
							delete lonelyObject[myId];
							lonelyObject[newLonelyId]=newNum;
						}else{
							
							var newLonelyId=myId+(val.son.length-1);
							lonelyObject[newLonelyId]= 1 ;
						}
					}
					mapTree(val.son,key);
				}else if(val.son.length>0&&key!=myArr.length-1){
					mapTree(val.son,key);
				}

			});
		};

		mapTree(treeArr,'');
		return levelObject;
	};