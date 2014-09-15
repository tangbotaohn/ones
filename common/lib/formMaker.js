(function(){
    'use struct';
    angular.module("ones.formMaker", ["ones.select3Module"])
        .directive("commonform", ["$compile", "FormMaker", function($compile, FormMaker) {
            return {
                restrict: "E",
                scope: {
                    config: "=",
                    data: "="
                },
                replace: true,
                transclusion: true,
                compile: function(element, attrs, transclude) {
                    return {
                        pre: function($scope, iElement, iAttrs, controller) {
                            $scope.$on("commonForm.ready", function() {
                                var fm = new FormMaker.makeForm($scope);
                                var html = fm.makeHTML();
                                iElement.append($compile(html)($scope.$parent));
                                setTimeout(function(){
                                    var ele = iElement.find("input").eq(0);
                                    $(ele).trigger("click").focus();
                                }, 200);
                            });
                        }
                    };
                }
            };
        }])
        .directive("commongrid", ["$compile", function($compile) {
            return {
                restrict: "E",
                replace: true,
                transclusion: true,
                compile: function(element, attrs, transclude) {
                    return {
                        pre: function($scope, iElement, iAttrs, controller) {
                            $scope.$on("commonGrid.ready", function() {
                                var html = '<div class="gridStyle" ng-grid="gridOptions"></div>';
                                iElement.append($compile(html)($scope));
                            });
                        }
                    };
                }
            };
        }])
        .directive("aceupload", ["$rootScope", function($rootScope){
            return {
                restrict: "E",
                replace: true,
                transclusion: true,
                scope: {
                    config: "="
                },
                compile: function() {
                    return {
                        pre: function($scope, iElement, iAttrs, controller) {
                            var config = $scope.$parent.$eval(iAttrs.config) || {};
                            iElement.append(sprintf('<input type="file" %s />', config.multiple || ""));
                            var conf = {
                                btn_choose: $rootScope.i18n.lang.messages.drag_or_chose_file,
                                btn_change: $rootScope.i18n.lang.messages.drag_or_chose_file,
                                droppable: true,
                                onchange:null,
                                whitelist:'gif|png|jpg|jpeg',
                                no_icon:'icon-cloud-upload',
                                style: "well",
                                thumbnail: "fit"
                            }
                            conf = $.extend(conf, config);
                            iElement.find("input").ace_file_input(conf);
                        }
                    };
                }
            };
        }])
        .directive('ensureunique', ['$http', "$injector", "$timeout","$parse", function($http, $injector, $timeout, $parse) {
            return {
                require: 'ngModel',
                link: function(scope, ele, attrs, c) {
                    scope.$watch(attrs.ngModel, function(newVal, oldVal) {

                        if(!newVal) {
                            var getter = $parse(attrs.ngModel);
                            getter.assign(scope, c.$viewValue);
                        }

                        var res = $injector.get(attrs.ensureunique);
                        var queryParams = {
                            id: 0,
                            excludeId:  $injector.get("$routeParams").id
                        };

                        queryParams[attrs.name] = scope.$eval(attrs.ngModel);

                        var promise = getDataApiPromise(res, "get", queryParams)

                        promise.then(function(data){
                            if(data[attrs.name]) {
                                c.$setValidity('unique', false);

                            } else {
                                c.$setValidity('unique', true);
                            }

                        }, function(){
                            c.$setValidity('unique', false);
                        });


//                        $http({
//                            method: 'POST',
//                            url: '/api/check/' + attrs.ensureUnique,
//                            data: {'field': attrs.ensureUnique}
//                        }).success(function(data, status, headers, cfg) {
//                            c.$setValidity('unique', data.isUnique);
//                        }).error(function(data, status, headers, cfg) {
//                            c.$setValidity('unique', false);
//                        });
                    });
//                },
//                link: function(scope, element, iattrs, transclude) {
//                    return {
//                        pre: function($scope, iElement, attrs, c) {
//                            var res = $injector.get(attrs.ensureunique);
//                            $scope.$watch(attrs.ngModel, function(newVal, oldVal) {
//                                var queryParams = {
//                                    id: 0,
//                                    excludeId:  $injector.get("$routeParams").id
//                                };
////                                if(!newVal) {
////                                    c.$setValidity('unique', true);
////                                    return;
////                                }
//                                queryParams[attrs.name] = $scope.$eval(attrs.ngModel);
//                                var promise = getDataApiPromise(res, "get", queryParams)
//                                promise.then(function(data){
//                                    if(data[attrs.name]) {
//                                        c.$setValidity('unique', false);
//                                    } else {
//                                        c.$setValidity('unique', true);
//                                    }
//
//                                }, function(){
//                                    c.$setValidity('unique', false);
//                                });
//
////                                if(!$scope.$$phase) {
////                                    $scope.$digest();
////                                }
//                            });
//                        }
//                    };
                }
            };
        }])
        .directive("inputfield", ["$compile", "FormMaker", function($compile, FormMaker) {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    config: "="
                },
                compile: function(element, attrs, transclude) {
                    return {
                        pre: function($scope, iElement, iAttrs, controller) {
                            var fieldDefine = $scope.$parent[iAttrs.config].fieldDefine;
                            var formMaker = new FormMaker.makeField($scope);
                            var html = formMaker.maker.factory($scope.$parent[iAttrs.config].context, fieldDefine, $scope);

                            iElement.append($compile(html)($scope.$parent));
                        }
                    };
                }
            };
        }])

        .directive("bill", ["$compile", "FormMaker", "$timeout", function($compile, FormMaker, $timeout) {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    config: "="
                },
                transclusion: true,
                compile: function(element, attrs, transclude) {
                    return {
                        pre: function($scope, iElement, iAttrs, controller) {
                            $scope.$on("commonBill.ready", function(){
                                if ($scope.$parent.billConfig.isEdit) {
                                    $scope.$on("bill.dataLoaded", function(evt, data) {
                                        timeToFormat = [
                                            "inputTime",
                                            "input_time",
                                            "dateline",
                                            "start_time",
                                            "end_time"
                                        ];
                                        angular.forEach(data, function(item, k){
                                            for(var i=0;i<timeToFormat.length;i++) {
                                                if(k === timeToFormat[i]) {
                                                    if(String(item).length <= 10) {
                                                        item*=1000;
                                                    }
                                                    data[k] = new Date(item);
                                                }
                                            }
                                        });
                                        $scope.$parent.formMetaData = data;
                                        var b = new FormMaker.makeBill($scope);

                                        iElement.append($compile(b.makeHTML())($scope.$parent));
                                    });
                                } else {
                                    var b = new FormMaker.makeBill($scope);
                                    iElement.append($compile(b.makeHTML())($scope.$parent));
                                }
                            });
                        }
                    };
                }
            };
        }])
        .service("FormMaker", ["$compile", "$q", "$parse",  "$injector", "$timeout", "ones.config", "$rootScope",
            function($compile, $q, $parse, $injector, $timeout, ONESConfig, $rootScope) {
                var service = {};
                service.makeField = function(scope, opts) {
                    var defaultOpts = {};
                    this.scope = scope;
                    this.opts = $.extend(defaultOpts, opts);
                    this.templates = {
                        "fields/text": '<input type="text" %s />',
                        "fields/number": '<input type="number" %s />',
                        "fields/select": '<select %(attr)s '+
                            'ng-options="%(key)s.value as %(key)s.name for %(key)s in %(data)s" '+
                            'search_contains="true" disable_search_threshold="10"'+
                            '><option></option></select>',
                        'fields/static': '<span ng-bind="%s"></span>',
                        'fields/email': '<input type="email" %s />',
                        'fields/textarea': '<textarea %s>%s</textarea>',
                        'fields/password': '<input type="password" %s />',
                        'fields/select2': '<ui-select ng-model="%(model)s" class="editAble" %(event)s theme="selectize" reset-search-input="false" %(attrs)s>'+
                            '<match ng-bind-html="$select.selected.label"></match>'+
                            '<choices refresh="%(method)s_refresh($select.search)" refresh-delay="0" repeat="%(data)s in %(method)s | filter: $select.search">'+
                            '<div ng-bind-html="%(data)s.label"></div>'+
                            '</choices>'+
                            '</ui-select>',
                        'fields/datepicker': '<span class="input-icon input-icon-right"> \
                                    <input type="text" class="form-control" \
                            size="%(size)s" \
                            ng-model="%(model)s" \
                            data-date-format="%(format)s" \
                            data-autoclose="true" %(attrs)s \
                            bs-datepicker /> \
                                <i class="icon-calendar gray"></i> \
                            </span>',
//                "fields/select2": '<select ngyn-select2 %(attrs)s '+
//                        'ng-options="%(key)s.value as %(key)s.name for %(key)s in %(data)s" '+
//                        'search_contains="true" '+
//                        'ui-select><option><option></select>',
                        'fields/typeahead': '<input type="text" ' +
                            'typeahead-on-select="showselected(this)" typeahead-editable="false" typeahead-min-length="0" ' +
                            'ng-options="%(key)s.label as %(key)s.label for %(key)s in %(data)s($viewValue)" %(attr)s '+
                            'data-html="true" bs-typeahead />',
                        'fields/craft': '<a class="craftSetLink" ng-bind="%(label)s" ng-click="%(action)s"></a>',
                        'fields/file': '<div class="fileUploadBtn btn btn-primary btn-minier" ng-click="showUploadModal()" ng-bind="i18n.lang.actions.upload"></div>' +
                            '<div ng-bind="%(model)s"></div>' +
                            '<input type="hidden" ng-model="%(model)s" />'
//                'fields/file': '<div ng-file-drop="onFileSelect($files)" ng-file-drag-over-class="optional-css-class" \
//                    ng-show="dropSupported">drop files here</div> \
//                    <div ng-file-drop-available="dropSupported=true" \
//                    ng-show="!dropSupported">HTML5 Drop File is not supported!</div> \
//                    <button ng-click="upload.abort()">Cancel Upload</button>'
                    };
                    this.maker = new service.fieldsMakerFactory(this, this.opts);
                };

                service.fieldsMakerFactory = function(fieldsMaker, opts) {
                    this.$parent = fieldsMaker;
                    var defaultOpts = {
                        multi: false,
                        compile: false
                    };
                    this.opts = $.extend(defaultOpts, opts);
                };


                service.fieldsMakerFactory.prototype = {
                    /**
                     * 字段生成器工厂方法，
                     * @name 字段name //context field, text, trid
                     * @fieldDefine 字段属性
                     * @scope 作用域对象
                     * @events 单个字段的事件列表，eg: ngBlur: doTextEndEdit;
                     * */
                    factory: function(context, fieldDefine, $scope, events) {
                        var method = "_" + (fieldDefine.inputType ? fieldDefine.inputType : "text");
                        //事件绑定
                        if (events) {
                            angular.forEach(events, function(func, event) {
                                fieldDefine[event] = func + "($event)";
                            });
                        }
                        if (context.text) {
                            fieldDefine.value = context.text;
                        }
                        if(context.trid !== undefined && this.opts.multi) {
                            fieldDefine["data-row-index"] = context.trid;
                        }
                        if (!fieldDefine.displayName) {
                            fieldDefine.displayName = toLang(context.field, "", $rootScope);
                        }
                        var html = false;
                        if (method in this) {
                            html = this[method](context.field, fieldDefine, $scope, context);
                        }
                        if($scope.formData && !$scope.formData[context.field] && fieldDefine.value){
                            $scope.formData[context.field] = fieldDefine.value;
                        }
                        if(html && this.opts.compile) {
                            html = $compile(html)($scope);
                        }

                        return html;
                    },
                    /**
                     * 生成字段属性
                     * 包括表单项的事件绑定
                     * */
                    _attr: function(name, fieldDefine, blackList) {
                        var k, v, html = [];
                        var bl = [
                            "inputType",
                            "listable",
                            "displayName",
                            "nameField",
                            "valueField",
                            "hideInForm",
                            "cellFilter",
                            "primary",
                            "dataSource"
                        ];
                        bl = $.extend(bl, blackList);
                        fieldDefine["autocomplete"] = "false";
                        //多行数据 如bill
                        if (!this.opts.multi) {
                            fieldDefine.id = "id_" + name;
                            fieldDefine.name = name;
                        }
                        for (k in fieldDefine) {
                            if (bl.indexOf(k) >= 0) {
                                continue;
                            }
                            v = fieldDefine[k];
                            html.push(sprintf('%s="%s"', k, v));
                        }
                        return html.join(" ");
                    },
                    _hidden: function(name, fieldDefine) {
                        return sprintf('<input type="hidden" ng-bind="%(bind)s" />', {
                            bind: fieldDefine["ng-model"]
                        });
                    },
                    _text: function(name, fieldDefine) {
                        return sprintf(this.$parent.templates["fields/text"], this._attr(name, fieldDefine));
                    },
                    _email: function(name, fieldDefine) {
                        return sprintf(this.$parent.templates["fields/email"], this._attr(name, fieldDefine));
                    },
                    //数字
                    _number: function(name, fieldDefine) {
                        return sprintf(this.$parent.templates["fields/number"], this._attr(name, fieldDefine));
                    },
                    _password: function(name, fieldDefine) {
                        delete(fieldDefine.value);
                        return sprintf(this.$parent.templates["fields/password"], this._attr(name, fieldDefine));
                    },
                    _datepicker: function(name, fieldDefine) {
                        if(fieldDefine.max) {
                            fieldDefine["data-date-max"] = fieldDefine.max;
                            delete(fieldDefine.max);
                        }
                        if(fieldDefine.min) {
                            fieldDefine["data-date-min"] = fieldDefine.min;
                            delete(fieldDefine.min);
                        }
                        return sprintf(this.$parent.templates["fields/datepicker"], {
                            attrs: this._attr(name, fieldDefine),
                            model: fieldDefine["ng-model"],
                            format: fieldDefine.format || "yyyy-MM-dd",
                            size: fieldDefine.size || 10
                        });
                    },
                    //多选框
                    _checkbox: function(name, fieldDefine) {

                    },
                    //文件上传
                    _file: function(name, fieldDefine, $scope) {
                        var parentScope = $scope.$parent;
                        parentScope.showUploadModal = function(){
                            var modalInstance = $injector.get("$modal")({
                                template: "common/base/views/uploader.html",
                                scope: parentScope
                            });
                        };

                        uploadermultiple = "";
                        if(fieldDefine.multiple) {
                            parentScope.uploaderMultiple = "multiple";
                        }

                        parentScope.uploaderAccept = "*";
                        if(fieldDefine.accept) {
                            parentScope.uploaderAccept = fieldDefine.accept;
                        }

                        var queueLimit = 1;
                        if(fieldDefine.multiple > 0) {
                            queueLimit = parseInt(fieldDefine.multiple);
                        }
                        parentScope.uploaderQueueLimit = queueLimit;

                        var uploaderObj = $injector.get("FileUploader");
                        var uploaderInstance = parentScope.uploader = new uploaderObj({
                            url: ONESConfig.BSU+"api/uploader",
                            queueLimit: queueLimit
                        });

//                parent.uploaderIsError = false;
                        var uploadedFiles = [];
                        uploaderInstance.onCompleteItem = function(i, msg, code){
                            if(code == 200) {
                                uploadedFiles.push(msg.uploadPath);
                            }
                            $parse(fieldDefine["ng-model"]).assign(parentScope, uploadedFiles.join("\n"));
                        }

                        return sprintf(this.$parent.templates["fields/file"], {
                            model: fieldDefine["ng-model"]
                        });
                    },
                    _static: function(name, fieldDefine) {
                        return "";
                        return sprintf(this.$parent.templates["fields/static"], fieldDefine["ng-model"]);
                    },
                    _craft: function(name, fieldDefine, $scope, context) {
                        context.td.html("");
                        var res = $injector.get("GoodsCraftRes");
                        var queryParams = {};
                        var self = this;
                        if(fieldDefine.queryWithExistsData) {
                            angular.forEach(fieldDefine.queryWithExistsData, function(qItem){
                                queryParams[qItem] = fieldDefine["data-row-index"] !== undefined
                                    ? $scope.$parent[self.opts.dataName][fieldDefine["data-row-index"]][qItem]
                                    : $scope.$parent[self.opts.dataName][qItem];
                            });
                        }

                        var goods_id = queryParams["goods_id"].split("_");
                        goods_id = goods_id[1];
                        $scope.$parent.formData[context.trid].craft = $scope.$parent.i18n.lang.undefined;
                        var crafts = [];
                        res.query({
                            goods_id: goods_id,
                            only_defined: true
                        }).$promise.then(function(data){
                                angular.forEach(data, function(item){
                                    crafts.push(item.name);
                                });
                                if(crafts.length) {
                                    $scope.$parent.formData[context.trid].craft = crafts.join(">");
                                }
                            });

                        var action = sprintf('doSetProductCraft(%d, \'%s\', this)',parseInt(goods_id), "");

                        return sprintf(this.$parent.templates["fields/craft"], {
                            label: fieldDefine["ng-model"],
                            action:action
                        });

                    },
                    _textarea: function(name, fieldDefine){
                        var value = fieldDefine.value;
                        delete(fieldDefine.value);
                        return sprintf(this.$parent.templates["fields/textarea"], this._attr(name, fieldDefine), value);
                    },
                    //下拉框选择
                    _select: function(name, fieldDefine, $scope) {
                        var valueField = fieldDefine.valueField || "id";
                        var nameField = fieldDefine.nameField || "name";
                        var data = [];
                        var self = this;
                        fieldDefine.chosen = "chosen";
                        fieldDefine.remoteDataField = fieldDefine.remoteDataField || name;
                        fieldDefine["data-placeholder"]= $scope.$parent.i18n.lang.messages.chosen_select_text;
                        fieldDefine["no-results-text"]= $scope.$parent.i18n.lang.messages.chosen_no_result_text;
                        if (fieldDefine.dataSource instanceof Array) {
                            for (var item in fieldDefine.dataSource) {
                                if (!item || !fieldDefine.dataSource[item][valueField]) {
                                    continue;
                                }
                                data.push({
                                    value: fieldDefine.dataSource[item][valueField],
                                    name: fieldDefine.dataSource[item][nameField]
                                });
                            }
                            $scope.$parent[fieldDefine.remoteDataField + "sSelect"] = data;
                        } else if (typeof (fieldDefine.dataSource) === "function" || typeof (fieldDefine.dataSource) === "string") {
                            if(typeof (fieldDefine.dataSource) === "string") {
                                fieldDefine.dataSource = $injector.get(fieldDefine.dataSource);
                            }

                            var queryParams = fieldDefine.queryParams || {};



                            //需要使用已有数据作为参数进行查询
                            if(fieldDefine.queryWithExistsData) {
                                angular.forEach(fieldDefine.queryWithExistsData, function(qItem){
                                    queryParams[qItem] = fieldDefine["data-row-index"] !== undefined
                                        ? $scope.$parent[self.opts.dataName][fieldDefine["data-row-index"]][qItem]
                                        : $scope.$parent[self.opts.dataName][qItem];
                                });
                            }

                            var promise = getDataApiPromise(fieldDefine.dataSource, "query", queryParams);
                            promise.then(function(result) {
                                angular.forEach(result, function(item) {
                                    data.push({
                                        value: item[valueField],
                                        name: item[nameField]
                                    });
                                });
                                $scope.$parent[fieldDefine.remoteDataField + "sSelect"] = data;
                            });
                        }

                        return sprintf(this.$parent.templates["fields/select"], {
                            attr: this._attr(name, fieldDefine),
                            key: name + "item",
                            data: fieldDefine.remoteDataField + "sSelect"
                        });


                    },
                    _select3: function(name, fieldDefine, $scope) {
                        var key = "s"+md5.createHash(fieldDefine["ng-model"]+"Select3Config");
                        fieldDefine.dataName = this.opts.dataName
                        $scope.$parent[key] = {
                            name: name,
                            fieldDefine: fieldDefine
                        };
                        return sprintf('<select3 config="%s"></select3>', key);
                    },
                    _select2: function(name, fieldDefine, $scope) {
                        var methodName = name + "DataSource";
                        var nameField = fieldDefine.nameField || "name";
                        var valueField = fieldDefine.valueField || "id";
                        var queryParams;
                        var self = this;
                        queryParams = $.extend(fieldDefine.queryParams || {}, {});

                        var oldval;

                        $scope.$parent[methodName] = undefined;

                        $scope.$parent[methodName+"_refresh"] = function(val){
                            if(oldval === val) {
                                return;
                            }
                            oldval = val;
                            if(fieldDefine.queryWithExistsData) {
                                angular.forEach(fieldDefine.queryWithExistsData, function(qItem){
                                    queryParams[qItem] = fieldDefine["data-row-index"] !== undefined
                                        ? $scope.$parent[self.opts.dataName][fieldDefine["data-row-index"]][qItem]
                                        : $scope.$parent[self.opts.dataName][qItem];
                                });
                            }
                            queryParams = $.extend(fieldDefine.queryParams || {}, {typeahead: val});
                            queryParams.limit = queryParams.limit ? queryParams.limit : 5;
                            fieldDefine.dataSource.query(queryParams, function(data){
                                var dataList = [];
                                angular.forEach(data, function(item) {
                                    dataList.push({
                                        label: item[nameField],
                                        value: item[valueField],
                                        category: item.goods_category_id,
                                        factory_code: item.factory_code
                                    });
                                });
                                $scope.$parent[methodName] = dataList;
                            });
                        };
//                console.log(methodName);
                        var html = sprintf(this.$parent.templates['fields/select2'], {
                            method: methodName,
                            data: name,
                            key: "forkey",
                            label: nameField,
                            model: fieldDefine["ng-model"],
                            event: fieldDefine["ui-event"] ? sprintf('ui-event="%s"', fieldDefine["ui-event"]) : "",
                            attrs: this._attr(name, fieldDefine)
//                    dataSource: dataSourceName
                        });

//                console.log(html);
                        return html;

                    },
                    _typeahead: function(name, fieldDefine, $scope) {
                        var methodName = name + "DataSource";
                        var nameField = fieldDefine.nameField || "name";
                        var valueField = fieldDefine.valueField || "id";
                        var queryParams;
                        queryParams = $.extend(fieldDefine.queryParams || {}, {});

                        $scope.$parent[methodName] = function(val){
                            queryParams = $.extend(fieldDefine.queryParams || {}, {typeahead: val});
                            var defer = $q.defer();
                            fieldDefine.dataSource.query(queryParams, function(data){
                                var dataList = [];
                                angular.forEach(data, function(item) {
                                    dataList.push({
                                        label: item[valueField]+"_"+item[nameField],
                                        value: item[valueField],
                                        category: item.goods_category_id,
                                        factory_code: item.factory_code
                                    });
                                });
                                defer.resolve(dataList);
                            });
                            return defer.promise.then(function(data){
                                return data;
                            });
                        };

                        //设置默认值
                        if (fieldDefine.value) {
                            $scope.$parent[name + "TAIT"] = fieldDefine.value;
                        }
                        //@todo 设置默认显示
                        //        if(fieldDefine.autoQuery) {
                        //            $scope.$parent.versionTAIT = "*";
                        //            $scope.$parent[methodName]();
                        //        }

                        var html = sprintf(this.$parent.templates["fields/typeahead"], {
                            key: name + "item",
                            data: methodName,
                            attr: this._attr(name, fieldDefine)
                        });
                        return html;
                    }
                };

                service.makeBill = function($scope){
                    var defaultOpts = {
                        minRows: 9,
                        dataName: "formData",
                        autoFocusNext: true,
                        methods: {},
                        relateMoney: false
                    };

                    this.scope = $scope;
                    this.compile = $compile;

                    this.opts = $.extend(defaultOpts, $scope.$parent.billConfig);


                    this.scope.$parent[this.opts.dataName] = this.scope.$parent[this.opts.dataName] || [];
                    this.scope.$parent.formMetaData = this.scope.$parent.formMetaData || {};
                    this.scope.$parent.isEdit = this.opts.isEdit;

                    this.opts.templates = this.templates = {
                        'bills/box.html' : '<table class="table table-bordered" id="billTable">'+
                            '<thead><tr><th>#</th><th></th>%(headHTML)s</tr></thead>'+
                            '<tbody>%(bodyHTML)s</tbody><tfoot><tr>%(footHTML)s</tr></tfoot></table>',
                        'bills/fields/rowHead.html': '<th>%(i)s</th><td class="center"><label class="rowHead">'+
                            '<i class="icon icon-plus" ng-click="billAddRow($event.target)"></i> '+
                            '<i class="icon icon-trash-o" ng-click="billRemoveRow($event.target)"></i> '+
                            '</label></td>',
                        'bills/fields/td.html': '<td class="%(tdClass)s" data-input-type="%(type)s" data-bind-model="%(field)s"><label ng-bind="%(bind)s" title="{{%(bind)s}}" %(event)s>%(label)s</label></td>',
                        'bills/fields/typeaheadList.html': '<ul class="typeAheadList editAble" />'+
                            '<li ng-repeat="%(v)s in %(data)s" type="typeahead" data-typeahead-value="%(v)s.%(valueField)s" '+
                            'ng-click="billTypeaheadClick($event)">{{%(v)s.%(labelField)s}}</li></ul>'
                    };

                    this.fm = new service.makeField($scope, {
                        multi: true, //指定为表单绑定多条数据
                        dataName: this.opts.dataName
                    });

                    if(isAppLoaded("workflow") && this.opts.workflowAlias) {

                    }

                };

                service.makeBill.prototype = {
                    makeHTML: function() {
                        this.bindEvents(this.scope);
                        return sprintf(this.opts.templates["bills/box.html"], {
                            headHTML : this.makeHead(this.opts.fieldsDefine),
                            bodyHTML : this.makeBody(this.opts.fieldsDefine),
                            footHTML : this.makeFoot(this.opts.fieldsDefine)
                        });
                    },
                    makeHead: function(fieldsDefine){
                        var html = [];
                        var self = this;
                        angular.forEach(fieldsDefine, function(item){
                            if(false === item.billAble) {
                                return;
                            }
                            if(self.opts.isEdit && true === item.onlyInAdd) {
                                return;
                            }
                            if(!self.opts.isEdit && true === item.onlyInEdit) {
                                return;
                            }
                            var attr = [];
                            if(item && "width" in item) {
                                attr.push('width="'+item.width+'"');
                            }
                            html.push(sprintf('<th %s>%s</th>', attr.join(""), item.displayName));
                        });
                        return html.join("");
                    },
                    makeBody: function(fieldsDefine){
                        var html = [], self=this;

                        //编辑模式下
                        var defaultData = self.scope.$parent.formMetaData.rows || [];
                        if(defaultData) {
                            this.scope.$parent.formMetaData.rows = defaultData = dataFormat(fieldsDefine, defaultData);
                        }
                        var defaultDataLength = defaultData.length || self.opts.minRows;
                        for(var i=0;i<defaultDataLength;i++) {
                            html.push(this.makeRow(fieldsDefine, i, defaultData));
                        }
                        return html.join("");

                        if(this.opts.isEdit) {
                            this.scope.$on("bill.dataLoaded", function(evt, data){
                                self.opts.defaultData = data.rows;
                                delete(data.rows);
                                self.scope.$parent.formMetaData = data;
                                for(var i=0;i<self.opts.defaultData.length;i++) {
                                    html.push(self.makeRow(fieldsDefine, i, self.opts.defaultData));
                                }
                                return html.join("");
                            });
                        } else {
                            for(var i=0;i<this.opts.minRows;i++) {
                                html.push(this.makeRow(fieldsDefine, i));
                            }
                            return html.join("");
                        }
                    },
                    makeFoot: function(fieldsDefine){
                        var html = ['<td colspan="2" align="center">'+this.scope.$parent.i18n.lang.total+'</td>'];
                        var hasTotalAble = false;
                        var self = this;
                        angular.forEach(fieldsDefine, function(item, field){
                            if(false === item.billAble) {
                                return;
                            }
                            if(self.opts.isEdit && true === item.onlyInAdd) {
                                return;
                            }
                            if(!self.opts.isEdit && true === item.onlyInEdit) {
                                return;
                            }
                            if(item.totalAble) {
                                hasTotalAble = true;
                                html.push(sprintf('<td class="tdTotalAble" tdname="%(field)s" id="tdTotalAble%(field)s" ng-bind="%(dataBind)s" title="{{%(dataBind)s}}">0</td>',
                                    {
                                        field: field,
                                        dataBind: item.cellFilter ? "formMetaData.total_"+field + "|"+item.cellFilter : "formMetaData.total_"+field
                                    }));
                            } else {
                                html.push("<td></td>");
                            }
                        });
                        if(hasTotalAble) {
                            return sprintf("<tr>%s</tr>", html.join(""));
                        } else {
                            return "";
                        }
                    },
                    makeRow: function(fieldsDefine,i, defaultData){
                        var self = this;
                        var html = [this.opts.templates['bills/fields/rowHead.html']];
                        defaultData = defaultData || [];
                        defaultData = dataFormat(fieldsDefine, defaultData);
                        this.scope.$parent[this.opts.dataName][i] = defaultData[i] || {};
                        this.fieldsDefine = fieldsDefine;
                        var label;
                        var labelBind;

                        angular.forEach(fieldsDefine, function(item, field){
                            if(false === item.billAble) {
                                return;
                            }
                            if(self.opts.isEdit && true === item.onlyInAdd) {
                                return;
                            }
                            if(!self.opts.isEdit && true === item.onlyInEdit) {
                                return;
                            }

                            if(defaultData.length) {
                                var curRowData = self.scope.$parent[self.opts.dataName][i];
                                //判断返回数据中是否有_label显示的字段
                                if(item.field+"_label" in curRowData) {
                                    curRowData[item.field+"_label"] = defaultData[i][item.field+"_label"];
                                    labelBind = sprintf('%s[%d].%s_label', self.opts.dataName, i, field);
                                } else {
                                    labelBind = sprintf('%s[%d].%s', self.opts.dataName, i, field);
                                }
                            } else {
                                labelBind = sprintf('%s[%d].%s', self.opts.dataName, i, item.labelField ? field+"_label" : field);
                            }
                            //过滤器
                            if(item.cellFilter) {
                                labelBind = sprintf("%s|%s", labelBind, item.cellFilter);
                            }

                            item.inputType = item.inputType ? item.inputType : "text";
                            html.push(sprintf(self.templates['bills/fields/td.html'], {
                                field: field,
                                type: item.inputType,
                                tdClass: false !== item.editAble ? "tdEditAble" : "",
                                event: false !== item.editAble ? 'ng-click="billFieldEdit($event.target)"' : "",
                                label: label,
                                bind: labelBind
                            }));
                        });

                        this.maxTrId = i;
                        return sprintf('<tr data-trid="%s">%s</tr>', i, sprintf(html.join(""), {
                            i: i+1
                        }));
                    },
                    bindEvents: function(scope){

                        var self = this;
                        var parentScope = self.parentScope = scope.$parent;
                        parentScope.billFieldEdit = function(ele){
                            var context = getLabelContext(ele);

                            //已经存在input
                            if(context.td.find(".editAble").length) {
                                context.td.find(".editAble").removeClass("hide").find("input");
                                context.inputAble.trigger("click").focus();
                                return;
                            }
                            var struct = self.opts.fieldsDefine[context.field];
                            struct.class="width-100 editAble";
                            struct.remoteDataField = sprintf("%s_%d", context.field, context.trid);
                            struct["ng-model"] = sprintf("%s[%d].%s", self.opts.dataName, context.trid, context.field);
                            if(struct.editAbleRequire) {
                                if(struct.editAbleRequire instanceof Array) {
                                    for(var i=0;i<struct.editAbleRequire.length;i++) {
                                        struct.editAbleRequire[i];
                                        if(!parentScope[self.opts.dataName][context.trid] || !parentScope[self.opts.dataName][context.trid][struct.editAbleRequire[i]]) {
                                            return false;
                                        }
                                    }
                                } else {
                                    if(!parentScope[self.opts.dataName][context.trid] || !parentScope[self.opts.dataName][context.trid][struct.editAbleRequire]) {
                                        return false;
                                    }
                                }
                            }


                            //支持的事件列表
                            var eventsList = ["blur", "click", "keydown", "focus", "change"];
                            var events = [];
                            angular.forEach(eventsList, function(e){
                                var m = sprintf("on%s%s%s", context.field.ucfirst(), context.inputType.ucfirst(), e.ucfirst());
                                if(m in parentScope) {
                                    //                            console.log(m);
                                    events.push(sprintf("%s:'%s($event)'", e, m));
                                } else {
                                    m = sprintf("on%s%s", context.inputType.ucfirst(), e.ucfirst());
                                    if(m in parentScope) {
                                        events.push(sprintf("%s:'%s($event)'", e, m));
                                    }
                                }
                            });

                            if(events.length) {
                                struct["ui-event"] = sprintf("{%s}", events.join());
                            }

                            //                    console.log(struct["ui-event"]);

                            var html = self.fm.maker.factory(context, struct, scope);
                            html = self.compile(html)(parentScope);
                            context.td.append(html);

                            //触发结束编辑事件
                            $timeout(function(){
                                context = getInputContext(ele);
                                context.inputAble.focus();
                                context.inputAble.bind("keydown", function(e){
                                    if(e.keyCode === 13) {
                                        self.parentScope.billEndEdit(context.td);
                                    }
                                });
                            }, 100);
                        };

                        //结束编辑 ele 应为td子元素
                        /**
                         * @todo 回调方法
                         * */
                        parentScope.billEndEdit = function(td, isBlur){
                            $timeout(function(){
                                var next = false;
                                var tdEditAbles = td.parent().find(".tdEditAble");
                                //            console.log(tdEditAbles);
                                var tds = [];
                                angular.forEach(tdEditAbles, function(td){
                                    tds.push(td);
                                });
                                if(tds.length > 1 && tds.indexOf(td[0])+1 < tds.length) {
                                    next = $(tds).eq(tds.indexOf(td[0])+1);
                                }

                                //自动跳到下一可编辑元素
                                if(self.opts.autoFocusNext && !isBlur) {
                                    if(!next) { //当前行无下一元素
                                        if(td.parent().index()+1 >= $("#billTable tbody tr").length) { //无更多行 自动增加一行
                                            self.parentScope.billAddRow(null, true);
                                        }
                                        next = $("#billTable tbody tr").eq(td.parent().index()+1).find("td.tdEditAble").eq(0);//跳到下一行
                                    }
                                    $timeout(function(){
                                        self.parentScope.billFieldEdit($(next).find("label"));
                                    });
                                }
                                self.scope.editing = false;
                                if("callback" in self.fieldsDefine[$(td).data("bind-model")]) {
                                    self.fieldsDefine[$(td).data("bind-model")].callback($(td).parent());
                                }
                            },200);

                        };

                        //增删行
                        parentScope.billAddRow = function(element, isTbody) {
                            var html = self.makeRow(self.opts.fieldsDefine, self.maxTrId+1);
                            html = self.compile(html)(self.parentScope);
                            if(true === isTbody) {
                                $("#billTable tbody").append(html);
                            } else {
                                $(element).parent().parent().parent().before(html);
                            }
                            self.reIndexTr();
                        };
                        parentScope.billRemoveRow = function(element) {
                            if($("#billTable tbody tr").length < 2) {
                                alert("At least 1 rows");
                                return;
                            }
                            var tr = $(element).parents("tr");
                            delete(parentScope[self.opts.dataName][tr.data("trid")])
                            tr.remove();
                            self.reIndexTr();

                            recountTotalAmount();
                            recountTotalAble();
                        };

                        //不同字段不同事件
                        parentScope.onTextBlur = function(event) {
                            var ele = $(event.target);
                            parentScope.billEndEdit(ele.parent(), true);
                            self.setData(ele, ele.val(), true);
                        };
                        parentScope.onTextKeydown = function(event) {
                            if(event.keyCode === 9 && !event.shiftKey) {
                                window.event.returnValue=false;
                                var ele = $(event.target);
                                self.setData(ele, ele.val());
                            } else if(event.keyCode === 13) {
                                var ele = $(event.target);
                                self.setData(ele, ele.val());
                            } else if((event.shiftKey) && (event.keyCode ===9)) {
                                window.event.returnValue=false;
                            }
                        };
                        if(parentScope.onNumberBlur === undefined) {
                            parentScope.onNumberBlur = function(event) {
                                var ele = $(event.target);
                                parentScope.billEndEdit(ele.parent(), true);
                                self.setNumberData(ele, ele.val(), true);
                            };
                        }
                        parentScope.onNumberKeydown = function(event) {
                            if(event.keyCode == 9 && !event.shiftKey) {
                                window.event.returnValue=false;
                                var ele = $(event.target);
                                self.setNumberData(ele, ele.val());
                            } else if(event.keyCode == 13) {
                                var ele = $(event.target);
                                self.setNumberData(ele, ele.val());
                            } else if((event.shiftKey) && (event.keyCode==9)) {
                                window.event.returnValue=false;
                            }
                        };
                        parentScope.onTypeaheadBlur = function(event){
                            var ele = $(event.target);
                            self.setTypeaheadData(ele, self.scope, true);
                        };
                        parentScope.onTypeaheadKeydown = function(event) {
                            if(event.keyCode == 9) {
                                window.event.returnValue=false;
                                var ele = $(event.target);
                                self.setTypeaheadData(ele, self.scope);
                            } else if(event.keyCode == 13) {
                                var ele = $(event.target);
                                self.setTypeaheadData(ele, self.scope);
                            }
                        };
                        parentScope.onSelect2Keydown = function(event) {
//                            console.log(arguments);
                        };
                        parentScope.onSelect3Blur = function(event) {
                            var context = getInputContext(event.target);
                            parentScope.billEndEdit(context.td, true);
                        };
                        parentScope.onStockSelect3Blur = function(event){
                            //                    console.log(self);
                            //                    console.log(event.target);return;
                            //                    self.parentScope.onTypeaheadBlur(event);
                            $timeout(function(){
                                var context = getInputContext(event.target);
                                var tmp = self.parentScope[self.opts.dataName][context.trid];
                                var queryParams = {
                                    id: 0,
                                    stock_id: tmp.stock
                                };
                                queryParams = $.extend(tmp, queryParams);
//                                console.log(queryParams);
//                                if(tmp.factory_code_all) {
//                                    queryParams.factory_code_all = tmp.factory_code_all;
//                                } else {
//                                    queryParams.factory_code_all = sprintf("%s-%s-%s", tmp.goods_id.split("_")[0], tmp.standard, tmp.version);
//                                }
                                getDataApiPromise($injector.get("Store.StockProductListAPI"), "get", queryParams)
                                    .then(function(data){
                                        self.parentScope[self.opts.dataName][context.trid].store_num=data.num || 0;
                                        //                        context.tr.find("[data-bind-model=store_num] label").text(data.num||0);
                                        //                self.parentScope[self.opts.dataName][context.trid].store_num=data.num;
                                    });
                            }, 200);

                        };

                        var countRowAmount = parentScope.countRowAmount = function(index){
                            var price =  parentScope.formData[index].unit_price
                            var num = parentScope.formData[index].num;
                            var discount = parentScope.formData[index].discount;
                            //计算折扣
                            if(discount === undefined || parseInt(discount) === 0) {
                                discount = 100;
                            };
                            parentScope.formData[index].amount = Number(parseFloat(num * price * discount / 100).toFixed(2));
                        };
                        var recountTotalAmount = parentScope.recountTotalAmount = function() {
                            var totalAmount = 0;
                            angular.forEach(parentScope.formData, function(row){
                                if(!row || !row.amount) {
                                    return;
                                }
                                totalAmount += Number(row.amount);
                            });
                            parentScope.formMetaData.total_amount = totalAmount;
                        };

                        var recountTotalAble = parentScope.recountTotalAble = function(){

                            angular.forEach($("#billTable tbody tr:first td"), function(td){
                                var element = $(td).find(".editAble");
                                if(!element.length) {
                                    return false;
                                }
                                if(element.attr("totalAble")) {
                                    var total = 0;
                                    var context = getInputContext(element);
                                    angular.forEach(parentScope[self.opts.dataName], function(item){
                                        if(item && context.field in item) {
                                            total += parseFloat(item[context.field]);
                                        }
                                    });
                                    total = total.toFixed(2);
                                    var data = 0;
                                    data = parseFloat(data).toFixed(2);
                                    parentScope.formMetaData["total_"+context.field] = total;
                                }
                            });


                        };

                        /**
                         * 数量变动时，计算行内总价，更新数量统计，更新总金额
                         * */
                        parentScope.onNumNumberBlur = function(event){
                            var context = getInputContext(event.target);

                            if(!parentScope.formData[context.trid].discount && parentScope.formMetaData.customerInfo) {
                                parentScope.formData[context.trid].discount = parentScope.formMetaData.customerInfo.discount;
                            }
                            var totalNum = 0;
                            angular.forEach(parentScope.formData, function(item){
                                if(!item || !item.num) {
                                    return;
                                }
                                totalNum += Number(item.num);
                            });
                            parentScope.formMetaData.total_num = totalNum;
                            if(parentScope.formData[context.trid] && parentScope.formData[context.trid].goods_id) {
                                if(!parentScope.formData[context.trid].unit_price){
                                    var gid = parentScope.formData[context.trid].goods_id.split("_");
                                    var goods = $injector.get("GoodsRes").get({
                                        id: gid[1]
                                    }).$promise.then(function(data){
                                            parentScope.formData[context.trid].unit_price = Number(data.price);
                                            parentScope.countRowAmount(context.trid);
                                            parentScope.recountTotalAmount();
                                        });
                                } else {
                                    parentScope.countRowAmount(context.trid);
                                    parentScope.recountTotalAmount();
                                }
                            }
                        };

                        /**
                         * 如果涉及到金额，加入默认计算事件
                         * */
                        if(self.opts.relateMoney) {
                            //实收金额
                            parentScope.$watch('formMetaData.total_amount', function(){
                                parentScope.formMetaData.total_amount_real = parentScope.formMetaData.total_amount;
                            });

                            //单价
                            parentScope.onUnit_priceNumberBlur = function(event){
                                var context = getInputContext(event.target);
                                countRowAmount(context.trid);
                                recountTotalAmount();
                            };
                            //折扣
                            parentScope.onDiscountNumberBlur = function(event){
                                var context = getInputContext(event.target);
                                countRowAmount(context.trid);
                                recountTotalAmount();
                            };
                            //行内总价
                            parentScope.onTotal_amountNumberBlur = function(event){
                                var context = getInputContext(event.target);
                                recountTotalAmount();
                            };
                        }
                    },

                    //重置TR的行数，并且重新计算数据
                    reIndexTr: function() {
                        var trs = $("#billTable tbody tr");
                        var index = 1;
                        angular.forEach(trs, function(tr){
                            $(tr).find("th:first").html(index);
                            index++;
                        });
                    },
                    setNumberData: function(element, data, isBlur) {
                        if($(element).attr("totalAble")) {
                            var total = 0;
                            var context = getInputContext(element);
                            angular.forEach(this.scope.$parent[this.opts.dataName], function(item){
                                if(item && context.field in item) {
                                    total += parseFloat(item[context.field]);
                                }
                            });
                            total = total.toFixed(2);
                            data = parseFloat(data).toFixed(2);
                            this.scope.$parent.formMetaData["total_"+context.field] = total;
                            this.setData(element, data, isBlur);
                        } else {
                            this.setData(element, data, isBlur);
                        }

                    },
                    setData: function(element, data, isBlur) {
                        var context = getInputContext(element);
//                context.label.html(data);
                        context.td.find(".editAble").addClass("hide");
                        this.scope.$parent.billEndEdit(context.td, isBlur);
                    },
                    setTypeaheadData: function(ele, scope, isBlur) {
                        var val;
                        var context = getInputContext(ele);
                        var self = this;
                        $timeout(function(){
                            if(scope.$parent[self.opts.dataName][context.trid][context.field]) {
                                val = context.ele.val();
                            } else {
                                context.ele.val('');
                            }
                            context.td.find("label").text(val);
                            context.td.find(".editAble").addClass("hide");
                            scope.$parent.billEndEdit(context.td, isBlur);
                        }, 200);

                    }
                };

                service.makeForm = function($scope, config) {
                    this.scope = $scope;
                    config = config || {};
                    if(isEmptyObject(config)) {
                        config = $scope.$eval("$parent.formConfig");
                    }
                    if (!config.fieldsDefine) {
                        return false;
                    }

                    var defaultOpts = {
                        class: "form-horizontal",
                        submitAction: "doSubmit",
                        fieldsDefine: {},
                        includeFoot: true,
                        templates: {
                            "commonForm/form.html": '<form class="form-horizontal" name="%(name)s" ng-keydown="doKeydown($event)" novalidate>%(html)s</form>',
                            "commonForm/footer.html": '<div class="clearfix form-actions center">' +
                                '<button id="submitbtn" class="btn btn-primary" ng-click="%(action)s();" type="button">' +
                                '<i class="icon-ok bigger-110"></i>' +
                                '{{%(langsubmit)s}}' +
                                '</button>' +
                                '&nbsp; &nbsp; &nbsp;' +
                                '<button class="btn" type="reset">' +
                                '<i class="icon-undo bigger-110"></i>' +
                                '{{%(langreset)s}}' +
                                '</button>' +
                                '&nbsp; &nbsp; &nbsp;' +
                                '<button class="btn btn-info" onclick="history.back()">' +
                                '<i class="icon-undo bigger-110"></i>' +
                                '{{%(langreturn)s}}' +
                                '</button>' +
                                '</div>',
                            "commonForm/box.html": '<div class="form-group col-sm-%(colWidth)s" ng-class="{\'has-error\': %(formname)s.%(fieldname)s.$dirty&&%(formname)s.%(fieldname)s.$invalid}">' +
                                '<label class="col-sm-3 control-label no-padding-right">%(label)s</label>' +
                                '<div class="col-sm-%(inputBoxWidth)s">%(inputHTML)s</div>' +
                                '<div class="help-block col-sm-reset">' +
                                '<span ng-bind="%(formname)s.%(fieldname)s.$error|toError" ng-hide="%(formname)s.%(fieldname)s.$valid"></span>' +
                                '<span> %(helpText)s</span>' +
                                '</div>' +
                                '</div>',
                            "commonForm/hide.html": '%(inputHTML)s',
                            "text": '<input type="text" %s />',
                            "number": '<input type="number" %s />',
                            "select": '<select %(attr)s ng-options="%(value)s as %(name)s for %(key)s in %(data)s"></select>'
                        },
                        name: "form",
                        dataName: "formData"
                    };

                    this.opts = $.extend(true, defaultOpts, config);

                    this.opts.dataName = this.opts.dataName ? this.opts.dataName : this.opts.name+"Data";

                    $scope.$parent[this.opts.dataName] = $scope.$parent[this.opts.dataName] || {};
                    $scope[this.opts.dataName] = {};

                    $scope.$parent.doKeydown = function(event){

                    //绑定回车提交事件
                        if(event.keyCode === 13
                            && $(event.target).attr("ng-model")
                            && !$(event.target).is("textarea")
                            && !$(event.target).hasClass("select3Input")) {
                            event.preventDefault();
                            event.stopPropagation();
                            $scope.$parent.doSubmit();
                        }
                    };

                    //this.fieldsMaker
                    this.fm = new service.makeField($scope, this.opts);
                };

                service.makeForm.prototype = {
                    makeHTML : function() {
                        if(this.formBuilded) {
                            return;
                        }
                        var self = this;
                        var fieldHTML, finalHTML = [];
                        var boxHTML = this.opts.templates["commonForm/box.html"];

                        var colWidth = self.opts.columns ? 12/self.opts.columns : null;
                        //隐藏字段
                        angular.forEach(this.opts.fieldsDefine, function(struct, field){
                            if(struct.inputType === "hidden") {
                                boxHTML = self.opts.templates["commonForm/hide.html"];
                            } else {
                                boxHTML = self.opts.templates["commonForm/box.html"];
                            }
                            struct.class = "width-100";
                            struct["ng-model"] = self.opts.dataName+"."+field;
                            if(struct.required !== false) {
                                struct.required = "required";
                            } else {
                                delete(struct.required);
                            }
                            self.scope.$parent[self.opts.dataName][field] = "";
                            //默认值
                            if(struct.value) {
                                self.scope.$parent[self.opts.dataName][field] = struct.value;
                            }

                            if(!struct.hideInForm && !struct.primary) {
                                fieldHTML = self.fm.maker.factory({field: field}, struct, self.scope);
                                if (false !== fieldHTML) {
                                    if(struct.colspan) {
                                        colWidth = colWidth * struct.colspan;
                                    }
                                    var helpText = "";
                                    if(struct.helpText) {
                                        helpText = toLang(struct.helpText, "helpTexts", self.scope.$root);
                                    }
                                    finalHTML.push(sprintf(boxHTML, {
                                        helpText: helpText,
                                        colWidth: colWidth,
                                        inputBoxWidth: self.opts.columns>1 ? 6 : 4,
                                        formname: self.opts.name,
                                        fieldname: struct.name ? struct.name : field,
                                        label: struct.displayName,
                                        inputHTML: fieldHTML
                                    }));
                                }
                            }
                        });

                        //包含表单结尾
                        if(self.opts.includeFoot) {
                            finalHTML.push(this.makeActions());
                        }

                        self.formBuilded = true;
                        return sprintf(self.opts.templates["commonForm/form.html"], {
                            name : self.opts.name,
                            html : finalHTML.join("")
                        });
                    },
                    makeActions: function(){
                        if(this.opts.formActions === false) {
                            return '<div class="clearfix"></div>';
                        }
                        return sprintf(this.opts.templates["commonForm/footer.html"], {
                            action: this.opts.submitAction,
                            langsubmit: "i18n.lang.actions.submit",
                            langreset: "i18n.lang.actions.reset",
                            langreturn: "i18n.lang.actions.return"
                        });
                    }

                };

                return service;
            }]);
})();