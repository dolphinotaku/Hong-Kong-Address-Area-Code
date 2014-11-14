// JavaScript Document

var app = angular.module("MyApp", []);
app.run(function($rootScope) {
	$rootScope.tempParts = [];
    $rootScope.addressLastParts = [];
    $rootScope.asAtFileContent = {};
    $rootScope.toBeFileContent = {};
});

// Ajax get the external JSON
app.controller("asAtDictionary", function($scope, $http, CustomAddressLastPart) {
	$scope.getJSONResult = "Fail";
	$scope.fileSource = "";
	$http.get('check-address-area.txt').
    success(function(data, status, headers, config) {
		$scope.getJSONResult = "OK";
		$scope.fileSource = data;
		CustomAddressLastPart.setFileContent(data);
    }).
    error(function(data, status, headers, config) {
	$scope.fileSource = defaultDictionary;
	  CustomAddressLastPart.setFileContent(defaultDictionary);
    });
});

// Controller customAddress
app.controller("customAddress", function($scope, CustomAddressLastPart, $rootScope){
	$scope.customAddressText = "";
	$scope.addressLastPart = "";
	$scope.lastParts = [];
	
	$scope.toBe = {};
	$scope.newjson = "";
	
	$scope.isDisabled = false;
	$scope.isLock = [];
	
	$scope.matchAreaCode = new Array();
	$scope.toExcelAreaCode = "";
	
	// split and trim the last part address from "custom address list"
	$scope.getAddressLastPart = function(addressList){
            textInLine = addressList.split('\n');
			var _customAddressLastPart = "";
			for(i=0; i<textInLine.length; i++){
				commaIndex = textInLine[i].lastIndexOf(",");
				var addressLastLine = textInLine[i].substring(commaIndex+1, textInLine[i].length);
				addressLastLine = addressLastLine.trim();
				if(!addressLastLine)
					continue;
				_customAddressLastPart += addressLastLine + "\n";
			}
			_customAddressLastPart = _customAddressLastPart.trim();
		$scope.addressLastPart = _customAddressLastPart;
		//var lastPartsArray = $scope.addressLastPart.split('\n');
		$scope.lastParts = $scope.genLastPartUI($scope.addressLastPart.split('\n'));
		return $scope.addressLastPart;
	}
	// End - split and trim...
	
	// refresh UI - user select block entries
	$scope.genLastPartUI = function(tempParts){
		var tempLastParts = [];
		$scope.toExcelAreaCode = "";
		
		for(i=0; i<tempParts.length; i++){
			var lastPart = tempParts[i].toLowerCase();
			var tempAreaCode = "";
			
			tempLastParts[i] = {};
			$scope.isLock[i] = false;
			// assign last part address text
			tempLastParts[i].text = lastPart;
			
			// check is exists in as at dictionary
			for(key in $rootScope.asAtFileContent){
				if($rootScope.asAtFileContent[key].indexOf(lastPart)>=0){
					tempAreaCode = key.toUpperCase();
					$scope.isLock[i] = true;
				}
			}
			
			// gen the area code result list
			if(tempAreaCode!=""){
					$scope.toExcelAreaCode += tempAreaCode+"\n";
			}else{
					$scope.toExcelAreaCode += "\r\n";
			}
			// assign the identified area code
			tempLastParts[i].areaCode = tempAreaCode;
			
		}
		
		return tempLastParts;
	}
	// End - refresh UI
	
	// trigger when user click lock/unlock button
	$scope.reverseLock = function(statusShould, lockIndex){
		var toBeLockStatus = false;
		var address = $scope.lastParts[lockIndex].text;
		
		if(statusShould == "lock")
			toBeLockStatus = true;
		$scope.isLock[lockIndex] = toBeLockStatus;
		// search the same address and sync the lock status
		angular.forEach($('input.political-area'), function(element, index){
			var otherAddress = $(element).val();
			if(otherAddress == address){
				$scope.isLock[index] = toBeLockStatus;
			}
		});
	}
	
	// trigger when user change Area Code on selection box / input box
	$scope.customAreaCodeChange = function(address, areaCode, currentIndex){
		var tempToExcelAreaCode="";
			
		// search the same address and sync the selection
		angular.forEach($('input.political-area'), function(element){
			var otherAddress = $(element).val();
			if(otherAddress == address){
				$(element).next().val(areaCode);
				$(element).next().next().val(areaCode);
			}
		});
		
		//angular.forEach($('select.area-list'), function(node){
		$("select.area-list").each(function( index, element ) {
		
			var isExistsInCurrentDictionary = false;
			var existsInCurrentArea = "";
			var currentElement = $(element);
			var currentAddress = $(element).prev().val();
			var currentAreaCode = $(element).val();
			
			if( currentAreaCode == null || currentAreaCode == "")
				return true;
					
			// is exists in as at dictionary
			for(key in $rootScope.asAtFileContent){
				if($rootScope.asAtFileContent[key].indexOf(currentAddress)>=0){
					isExistsInCurrentDictionary = true;
					existsInCurrentArea = key;
					break;
				}
			}
			
			// prepare to be dictionary
			if(!isExistsInCurrentDictionary){
				if(typeof $scope.toBe[currentAreaCode] == "undefined")
					$scope.toBe[currentAreaCode] = "";
				var	newDictionary = $scope.toBe[currentAreaCode];				
				if(newDictionary.indexOf(currentAddress) == -1){
					if($scope.toBe[currentAreaCode].trim() == "")
						$scope.toBe[currentAreaCode] = currentAddress;
					else
						$scope.toBe[currentAreaCode] += ","+currentAddress;
				}
			}
			
		});
		
		angular.forEach($('select.area-list'), function(node){
				// refresh area code result list
				tempToExcelAreaCode+=$(node).val()+"\r\n";
			});
		$scope.toExcelAreaCode = tempToExcelAreaCode.trim();
	}
	
	// is show refresh/update json button
	$scope.isToBeNotNull = function(){
		var isNotNull = false;
		for(var key in $scope.toBe){
			if($scope.toBe[key] != ""){
				isNotNull = true;
				break;
			}
		}
		return isNotNull;
	}
	
	// refresh new json
	$scope.refreshNewJson = function(){
		//var toBeFileContent = $rootScope.toBeFileContent;
		//$scope.newjson = toBeFileContent;
		var toBeFileContent = $rootScope.asAtFileContent
		//$scope.newjson = $rootScope.asAtFileContent;
		
		for(var areaCodeIndex in $scope.toBe){
			var newDefinition = $scope.toBe[areaCodeIndex];
			var breakToLines = newDefinition.split(",");
			for (var index in breakToLines){
				if(breakToLines[index] == null || breakToLines[index] == "")
					continue;
				var tempDictionary = toBeFileContent[areaCodeIndex.toLowerCase()];
				if(tempDictionary.indexOf(breakToLines[index])==-1)
					toBeFileContent['k'].push(breakToLines[index]);
			}
		}
		
		$scope.newjson = toBeFileContent;
		
		// disable control
		$scope.isDisabled = true;
	}
});

// public function
// setFileContent() - store json file contenr
// setAddressList() - store custom addresses list
app.service("CustomAddressLastPart", function($rootScope){
	var addressLastPart;// = [];
	var fileContent;
	
	var setAddressList = function(lines){
		addressLastPart = lines.split('\n');
	}
	var getAddressList = function(){
		return addressLastPart;
	}
	var setFileContent = function(json){
		$rootScope.asAtFileContent = json;
		$rootScope.toBeFileContent = json;
		fileContent = json;
	}
	var getFileContent = function(){
		return $rootScope.asAtFileContent;
	}
  return {
    setAddressList: setAddressList,
    getAddressList: getAddressList,
    setFileContent: setFileContent,
    getFileContent: getFileContent,
	addressLastPart: addressLastPart
  };
});

var defaultDictionary = {
	"h":[
		"southern",
		"central & western",
		"central and western",
		"wan chai",
		"eastern"
	],
	"f":[
		"island",
		"lantau island",
		"lantao island",
		"cheung chau"
	],
	"k":[
		"sham shui po",
		"kowloon city",
		"kwun tong",
		"wong tai sin",
		"yau tsim mong"
	],
	"n":[
		"kwai tsing",
		"north",
		"sai kung",
		"sha tin",
		"shatin",
		"tai po",
		"tsuen wan",
		"tuen mun",
		"yuen long"
	]
};


app.directive('tabs', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {},
      controller: function($scope, $element) {
        var panes = $scope.panes = [];
 
        $scope.select = function(pane) {
          angular.forEach(panes, function(pane) {
            pane.selected = false;
          });
          pane.selected = true;
        }
 
        this.addPane = function(pane) {
          if (panes.length == 0) $scope.select(pane);
          panes.push(pane);
        }
      },
      template:
        '<div class="tabbable">' +
          '<ul class="nav nav-tabs">' +
            '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">'+
              '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
            '</li>' +
          '</ul>' +
          '<div class="tab-content" ng-transclude></div>' +
        '</div>',
      replace: true
    };
  })
 
app.directive('pane', function() {
    return {
      require: '^tabs',
      restrict: 'E',
      transclude: true,
      scope: { title: '@' },
      link: function(scope, element, attrs, tabsCtrl) {
        tabsCtrl.addPane(scope);
      },
      template:
        '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' +
        '</div>',
      replace: true
    };
  })