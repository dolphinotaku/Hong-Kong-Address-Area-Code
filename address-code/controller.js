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
	$http.get('check-address-area.txt').
    success(function(data, status, headers, config) {
		$scope.getJSONResult = "OK";
		CustomAddressLastPart.setFileContent(data);
    }).
    error(function(data, status, headers, config) {
	  CustomAddressLastPart.setFileContent(defaultDictionary);
    });
});

// Controller customAddress
app.controller("customAddress", function($scope){
	$scope.customAddressText = "";
});

// split the customAddress,
// filter the last part address
    app.filter('getAddressLastPart', function(CustomAddressLastPart) {
        return function(input) {
            // do some bounds checking here to ensure it has that index
            textInLine = input.split('\n');
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
			CustomAddressLastPart.setAddressList(_customAddressLastPart);
			return _customAddressLastPart;
        }
    });
	
// Controller customAddressAreaCode
app.controller("customAddressAreaCode", function($scope, CustomAddressLastPart, $rootScope){
	$scope.tempParts = CustomAddressLastPart.getAddressList();
	$scope.lastParts = [];
	
	$scope.toBeK = "";
	$scope.toBeHK = "";
	$scope.toBeN = "";
	$scope.toBeF = "";
	$scope.newjson = "";
	
	$scope.isDisabled = false;
	
	$scope.matchAreaCode = new Array();
	$scope.toExcelAreaCode = "";
	
	$scope.customAreaCodeChange = function(address, areaCode){
		var tempToExcelAreaCode="";
		$scope.toBeK = "";
		$scope.toBeHK = "";
		$scope.toBeN = "";
		$scope.toBeF = "";
			
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
				var newDictionary="";
				switch(currentAreaCode){
					case "K":
						newDictionary = $scope.toBeK;
						if(newDictionary.indexOf(currentAddress) == -1){
							if($scope.toBeK.trim() == "")
								$scope.toBeK = currentAddress;
							else
								$scope.toBeK += ","+currentAddress;
						}
						break;
					case "H":
						newDictionary = $scope.toBeHK;
						if(newDictionary.indexOf(currentAddress) == -1){
							if($scope.toBeHK.trim() == "")
								$scope.toBeHK = currentAddress;
							else
								$scope.toBeHK += ","+currentAddress;
						}
						break;
					case "N":
						newDictionary = $scope.toBeN;
						if(newDictionary.indexOf(currentAddress) == -1){
							if($scope.toBeN.trim() == "")
								$scope.toBeN = currentAddress;
							else
								$scope.toBeN += ","+currentAddress;
						}
						break;
					case "F":
						newDictionary = $scope.toBeF;
						if(newDictionary.indexOf(currentAddress) == -1){
							if($scope.toBeF.trim() == "")
								$scope.toBeF = currentAddress;
							else
								$scope.toBeF += ","+currentAddress;
						}
						break;
				}
			}
			
		});
		
		angular.forEach($('select.area-list'), function(node){
			// refresh area code result list
			tempToExcelAreaCode+=$(node).val()+"\n";
			});
		$scope.toExcelAreaCode = tempToExcelAreaCode.trim();
	}
	
	$scope.refreshUI = function(){
		$scope.tempParts = CustomAddressLastPart.getAddressList();
		$scope.lastParts = [];
		
		$scope.toExcelAreaCode = "";
		
		for(i=0; i<$scope.tempParts.length; i++){
			var lastPart = $scope.tempParts[i].toLowerCase();
			var tempAreaCode = "";
			
			$scope.lastParts[i] = {};
			$scope.lastParts[i].text = lastPart;
			
			// check is exists in as at dictionary
			for(key in $rootScope.asAtFileContent){
				if($rootScope.asAtFileContent[key].indexOf(lastPart)>=0){
					$scope.matchAreaCode[i] = key.toUpperCase();
					tempAreaCode = key.toUpperCase();
				}else{
				}
			}
			
			// gen the area code result list
			if(tempAreaCode!=""){
					$scope.toExcelAreaCode += tempAreaCode+"\n";
			}else{
					$scope.toExcelAreaCode += "\n";
			}
			$scope.lastParts[i].areaCode = tempAreaCode;
			
		}
		//$scope.newjson = $rootScope.toBeFileContent;
	}
	
	// refresh new json
	$scope.refreshNewJson = function(){
		$scope.newjson = $rootScope.toBeFileContent;
		var toBeDictionary = $scope.toBeK;
		if(toBeDictionary!=""){
			var toBeKLines = toBeDictionary.split(",");
			for(key in toBeKLines){
				if(toBeKLines[key] == null || toBeKLines[key] == "")
					continue;
				var tempDictionary = $scope.newjson['k'];
				if(tempDictionary.indexOf(toBeKLines[key])==-1)
					$scope.newjson['k'].push(toBeKLines[key]);
			}
		}
		var toBeDictionary = $scope.toBeHK;
		if(toBeDictionary!=""){
			var toBeKLines = toBeDictionary.split(",");
			for(key in toBeKLines){
				if(toBeKLines[key] == null || toBeKLines[key] == "")
					continue;
				var tempDictionary = $scope.newjson['h'];
				if(tempDictionary.indexOf(toBeKLines[key])==-1)
					$scope.newjson['h'].push(toBeKLines[key]);
			}
		}
		var toBeDictionary = $scope.toBeN;
		if(toBeDictionary!=""){
			var toBeKLines = toBeDictionary.split(",");
			for(key in toBeKLines){
				if(toBeKLines[key] == null || toBeKLines[key] == "")
					continue;
				var tempDictionary = $scope.newjson['n'];
				if(tempDictionary.indexOf(toBeKLines[key])==-1)
					$scope.newjson['n'].push(toBeKLines[key]);
			}
		}
		var toBeDictionary = $scope.toBeF;
		if(toBeDictionary!=""){
			var toBeKLines = toBeDictionary.split(",");
			for(key in toBeKLines){
				if(toBeKLines[key] == null || toBeKLines[key] == "")
					continue;
				var tempDictionary = $scope.newjson['f'];
				if(tempDictionary.indexOf(toBeKLines[key])==-1)
					$scope.newjson['f'].push(toBeKLines[key]);
			}
		}
		
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