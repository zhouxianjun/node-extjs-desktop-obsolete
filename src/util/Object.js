/**
 * Created with JetBrains WebStorm.
 * User: Gary
 * Date: 14-8-20
 * Time: 上午10:15
 * To change this template use File | Settings | File Templates.
 */

    var global = this,
        objectPrototype = Object.prototype,
        toString = objectPrototype.toString,
        enumerables = true,
        enumerablesTest = { toString: 1 },
        i;
    
    
    for (i in enumerablesTest) {
        enumerables = null;
    }
    
    if (enumerables) {
        enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable',
            'toLocaleString', 'toString', 'constructor'];
    }
    
    /**
     * An array containing extra enumerables for old browsers.
     * @property {String[]}
     */
    var TemplateClass = function(){};

    var ExtObject = {
        emptyFn: function(){},

        /**
         * Returns a new object with the given object as the prototype chain.
         * @param {Object} object The prototype chain for the new object.
         */
        chain: ('create' in Object) ? function(object){
            return Object.create(object);
        } : function (object) {
            TemplateClass.prototype = object;
            var result = new TemplateClass();
            TemplateClass.prototype = null;
            return result;
        },

        /**
         * Convert a `name` - `value` pair to an array of objects with support for nested structures; useful to construct
         * query strings. For example:
         *
         * Non-recursive:
         *
         *     var objects = ExtObject.Object.toQueryObjects('hobbies', ['reading', 'cooking', 'swimming']);
         *
         *     // objects then equals:
         *     [
         *         { name: 'hobbies', value: 'reading' },
         *         { name: 'hobbies', value: 'cooking' },
         *         { name: 'hobbies', value: 'swimming' }
         *     ]
         *
         * Recursive:
         *
         *     var objects = ExtObject.Object.toQueryObjects('dateOfBirth', {
     *         day: 3,
     *         month: 8,
     *         year: 1987,
     *         extra: {
     *             hour: 4,
     *             minute: 30
     *         }
     *     }, true);
         *
         *     // objects then equals:
         *     [
         *         { name: 'dateOfBirth[day]', value: 3 },
         *         { name: 'dateOfBirth[month]', value: 8 },
         *         { name: 'dateOfBirth[year]', value: 1987 },
         *         { name: 'dateOfBirth[extra][hour]', value: 4 },
         *         { name: 'dateOfBirth[extra][minute]', value: 30 }
         *     ]
         *
         * @param {String} name
         * @param {Object} value
         * @param {Boolean} [recursive=false] `true` to recursively encode any sub-objects.
         * @return {Object[]} Array of objects with `name` and `value` fields.
         */
        toQueryObjects: function(name, value, recursive) {
            var self = ExtObject.toQueryObjects,
                objects = [],
                i, ln;

            if (ExtObject.isArray(value)) {
                for (i = 0, ln = value.length; i < ln; i++) {
                    if (recursive) {
                        objects = objects.concat(self(name + '[' + i + ']', value[i], true));
                    }
                    else {
                        objects.push({
                            name: name,
                            value: value[i]
                        });
                    }
                }
            }
            else if (ExtObject.isObject(value)) {
                for (i in value) {
                    if (value.hasOwnProperty(i)) {
                        if (recursive) {
                            objects = objects.concat(self(name + '[' + i + ']', value[i], true));
                        }
                        else {
                            objects.push({
                                name: name,
                                value: value[i]
                            });
                        }
                    }
                }
            }
            else {
                objects.push({
                    name: name,
                    value: value
                });
            }

            return objects;
        },

        /**
         * Takes an object and converts it to an encoded query string.
         *
         * Non-recursive:
         *
         *     ExtObject.Object.toQueryString({foo: 1, bar: 2}); // returns "foo=1&bar=2"
         *     ExtObject.Object.toQueryString({foo: null, bar: 2}); // returns "foo=&bar=2"
         *     ExtObject.Object.toQueryString({'some price': '$300'}); // returns "some%20price=%24300"
         *     ExtObject.Object.toQueryString({date: new Date(2011, 0, 1)}); // returns "date=%222011-01-01T00%3A00%3A00%22"
         *     ExtObject.Object.toQueryString({colors: ['red', 'green', 'blue']}); // returns "colors=red&colors=green&colors=blue"
         *
         * Recursive:
         *
         *     ExtObject.Object.toQueryString({
     *         username: 'Jacky',
     *         dateOfBirth: {
     *             day: 1,
     *             month: 2,
     *             year: 1911
     *         },
     *         hobbies: ['coding', 'eating', 'sleeping', ['nested', 'stuff']]
     *     }, true);
         *
         *     // returns the following string (broken down and url-decoded for ease of reading purpose):
         *     // username=Jacky
         *     //    &dateOfBirth[day]=1&dateOfBirth[month]=2&dateOfBirth[year]=1911
         *     //    &hobbies[0]=coding&hobbies[1]=eating&hobbies[2]=sleeping&hobbies[3][0]=nested&hobbies[3][1]=stuff
         *
         * @param {Object} object The object to encode.
         * @param {Boolean} [recursive=false] Whether or not to interpret the object in recursive format.
         * (PHP / Ruby on Rails servers and similar).
         * @return {String} queryString
         */
        toQueryString: function(object, recursive) {
            var paramObjects = [],
                params = [],
                i, j, ln, paramObject, value;

            for (i in object) {
                if (object.hasOwnProperty(i)) {
                    paramObjects = paramObjects.concat(ExtObject.toQueryObjects(i, object[i], recursive));
                }
            }

            for (j = 0, ln = paramObjects.length; j < ln; j++) {
                paramObject = paramObjects[j];
                value = paramObject.value;

                if (ExtObject.isEmpty(value)) {
                    value = '';
                }
                else if (ExtObject.isDate(value)) {
                    value = ExtObject.Date.toString(value);
                }

                params.push(encodeURIComponent(paramObject.name) + '=' + encodeURIComponent(String(value)));
            }

            return params.join('&');
        },

        /**
         * Converts a query string back into an object.
         *
         * Non-recursive:
         *
         *     ExtObject.Object.fromQueryString("foo=1&bar=2"); // returns {foo: 1, bar: 2}
         *     ExtObject.Object.fromQueryString("foo=&bar=2"); // returns {foo: null, bar: 2}
         *     ExtObject.Object.fromQueryString("some%20price=%24300"); // returns {'some price': '$300'}
         *     ExtObject.Object.fromQueryString("colors=red&colors=green&colors=blue"); // returns {colors: ['red', 'green', 'blue']}
         *
         * Recursive:
         *
         *     ExtObject.Object.fromQueryString("username=Jacky&dateOfBirth[day]=1&dateOfBirth[month]=2&dateOfBirth[year]=1911&hobbies[0]=coding&hobbies[1]=eating&hobbies[2]=sleeping&hobbies[3][0]=nested&hobbies[3][1]=stuff", true);
         *
         *     // returns
         *     {
     *         username: 'Jacky',
     *         dateOfBirth: {
     *             day: '1',
     *             month: '2',
     *             year: '1911'
     *         },
     *         hobbies: ['coding', 'eating', 'sleeping', ['nested', 'stuff']]
     *     }
         *
         * @param {String} queryString The query string to decode.
         * @param {Boolean} [recursive=false] Whether or not to recursively decode the string. This format is supported by
         * PHP / Ruby on Rails servers and similar.
         * @return {Object}
         */
        fromQueryString: function(queryString, recursive) {
            var parts = queryString.replace(/^\?/, '').split('&'),
                object = {},
                temp, components, name, value, i, ln,
                part, j, subLn, matchedKeys, matchedName,
                keys, key, nextKey;

            for (i = 0, ln = parts.length; i < ln; i++) {
                part = parts[i];

                if (part.length > 0) {
                    components = part.split('=');
                    name = decodeURIComponent(components[0]);
                    value = (components[1] !== undefined) ? decodeURIComponent(components[1]) : '';

                    if (!recursive) {
                        if (object.hasOwnProperty(name)) {
                            if (!ExtObject.isArray(object[name])) {
                                object[name] = [object[name]];
                            }

                            object[name].push(value);
                        }
                        else {
                            object[name] = value;
                        }
                    }
                    else {
                        matchedKeys = name.match(/(\[):?([^\]]*)\]/g);
                        matchedName = name.match(/^([^\[]+)/);

                        //<debug error>
                        if (!matchedName) {
                            throw new Error('[ExtObject.Object.fromQueryString] Malformed query string given, failed parsing name from "' + part + '"');
                        }
                        //</debug>

                        name = matchedName[0];
                        keys = [];

                        if (matchedKeys === null) {
                            object[name] = value;
                            continue;
                        }

                        for (j = 0, subLn = matchedKeys.length; j < subLn; j++) {
                            key = matchedKeys[j];
                            key = (key.length === 2) ? '' : key.substring(1, key.length - 1);
                            keys.push(key);
                        }

                        keys.unshift(name);

                        temp = object;

                        for (j = 0, subLn = keys.length; j < subLn; j++) {
                            key = keys[j];

                            if (j === subLn - 1) {
                                if (ExtObject.isArray(temp) && key === '') {
                                    temp.push(value);
                                }
                                else {
                                    temp[key] = value;
                                }
                            }
                            else {
                                if (temp[key] === undefined || typeof temp[key] === 'string') {
                                    nextKey = keys[j+1];

                                    temp[key] = (ExtObject.isNumeric(nextKey) || nextKey === '') ? [] : {};
                                }

                                temp = temp[key];
                            }
                        }
                    }
                }
            }

            return object;
        },

        /**
         * Iterate through an object and invoke the given callback function for each iteration. The iteration can be stop
         * by returning `false` in the callback function. This method iterates over properties within the current object,
         * not properties from its prototype. To iterate over a prototype, iterate over obj.proto instead of obj.
         * In the next example, use ExtObject.Object.each(Person.proto ....) and so on.
         * For example:
         *
         *     var person = {
     *         name: 'Jacky',
     *         hairColor: 'black',
     *         loves: ['food', 'sleeping', 'wife']
     *     };
         *
         *     ExtObject.Object.each(person, function(key, value, myself) {
     *         console.log(key + ":" + value);
     *
     *         if (key === 'hairColor') {
     *             return false; // stop the iteration
     *         }
     *     });
         *
         * @param {Object} object The object to iterate
         * @param {Function} fn The callback function.
         * @param {String} fn.key
         * @param {Mixed} fn.value
         * @param {Object} fn.object The object itself
         * @param {Object} [scope] The execution scope (`this`) of the callback function
         */
        each: function(object, fn, scope) {
            for (var property in object) {
                if (object.hasOwnProperty(property)) {
                    if (fn.call(scope || object, property, object[property], object) === false) {
                        return;
                    }
                }
            }
        },

        /**
         * Merges any number of objects recursively without referencing them or their children.
         *
         *     var extjs = {
     *         companyName: 'Ext JS',
     *         products: ['Ext JS', 'Ext GWT', 'Ext Designer'],
     *         isSuperCool: true,
     *         office: {
     *             size: 2000,
     *             location: 'Palo Alto',
     *             isFun: true
     *         }
     *     };
         *
         *     var newStuff = {
     *         companyName: 'Sencha Inc.',
     *         products: ['Ext JS', 'Ext GWT', 'Ext Designer', 'Sencha Touch', 'Sencha Animator'],
     *         office: {
     *             size: 40000,
     *             location: 'Redwood City'
     *         }
     *     };
         *
         *     var sencha = ExtObject.Object.merge({}, extjs, newStuff);
         *
         *     // sencha then equals to
         *     {
     *         companyName: 'Sencha Inc.',
     *         products: ['Ext JS', 'Ext GWT', 'Ext Designer', 'Sencha Touch', 'Sencha Animator'],
     *         isSuperCool: true
     *         office: {
     *             size: 40000,
     *             location: 'Redwood City'
     *             isFun: true
     *         }
     *     }
         *
         * @param {Object} source The first object into which to merge the others.
         * @param {Object...} objs One or more objects to be merged into the first.
         * @return {Object} The object that is created as a result of merging all the objects passed in.
         */
        merge: function(source) {
            var i = 1,
                ln = arguments.length,
                mergeFn = ExtObject.merge,
                cloneFn = ExtObject.clone,
                object, key, value, sourceKey;

            for (; i < ln; i++) {
                object = arguments[i];

                for (key in object) {
                    value = object[key];
                    if (value && value.constructor === Object) {
                        sourceKey = source[key];
                        if (sourceKey && sourceKey.constructor === Object) {
                            mergeFn(sourceKey, value);
                        }
                        else {
                            source[key] = cloneFn(value);
                        }
                    }
                    else {
                        source[key] = value;
                    }
                }
            }

            return source;
        },

        /**
         * @param {Object} source
         */
        mergeIf: function(source) {
            var i = 1,
                ln = arguments.length,
                cloneFn = ExtObject.clone,
                object, key, value;

            for (; i < ln; i++) {
                object = arguments[i];

                for (key in object) {
                    if (!(key in source)) {
                        value = object[key];

                        if (value && value.constructor === Object) {
                            source[key] = cloneFn(value);
                        }
                        else {
                            source[key] = value;
                        }
                    }
                }
            }

            return source;
        },

        /**
         * Returns the first matching key corresponding to the given value.
         * If no matching value is found, `null` is returned.
         *
         *     var person = {
     *         name: 'Jacky',
     *         loves: 'food'
     *     };
         *
         *     alert(ExtObject.Object.getKey(sencha, 'food')); // alerts 'loves'
         *
         * @param {Object} object
         * @param {Object} value The value to find
         */
        getKey: function(object, value) {
            for (var property in object) {
                if (object.hasOwnProperty(property) && object[property] === value) {
                    return property;
                }
            }

            return null;
        },

        /**
         * Gets all values of the given object as an array.
         *
         *     var values = ExtObject.Object.getValues({
     *         name: 'Jacky',
     *         loves: 'food'
     *     }); // ['Jacky', 'food']
         *
         * @param {Object} object
         * @return {Array} An array of values from the object.
         */
        getValues: function(object) {
            var values = [],
                property;

            for (property in object) {
                if (object.hasOwnProperty(property)) {
                    values.push(object[property]);
                }
            }

            return values;
        },

        /**
         * Gets all keys of the given object as an array.
         *
         *     var values = ExtObject.Object.getKeys({
     *         name: 'Jacky',
     *         loves: 'food'
     *     }); // ['name', 'loves']
         *
         * @param {Object} object
         * @return {String[]} An array of keys from the object.
         * @method
         */
        getKeys: ('keys' in Object) ? Object.keys : function(object) {
            var keys = [],
                property;

            for (property in object) {
                if (object.hasOwnProperty(property)) {
                    keys.push(property);
                }
            }

            return keys;
        },

        /**
         * Gets the total number of this object's own properties.
         *
         *     var size = ExtObject.Object.getSize({
     *         name: 'Jacky',
     *         loves: 'food'
     *     }); // size equals 2
         *
         * @param {Object} object
         * @return {Number} size
         */
        getSize: function(object) {
            var size = 0,
                property;

            for (property in object) {
                if (object.hasOwnProperty(property)) {
                    size++;
                }
            }

            return size;
        },

        /**
         * @private
         */
        classify: function(object) {
            var objectProperties = [],
                arrayProperties = [],
                propertyClassesMap = {},
                objectClass = function() {
                    var i = 0,
                        ln = objectProperties.length,
                        property;

                    for (; i < ln; i++) {
                        property = objectProperties[i];
                        this[property] = new propertyClassesMap[property];
                    }

                    ln = arrayProperties.length;

                    for (i = 0; i < ln; i++) {
                        property = arrayProperties[i];
                        this[property] = object[property].slice();
                    }
                },
                key, value, constructor;

            for (key in object) {
                if (object.hasOwnProperty(key)) {
                    value = object[key];

                    if (value) {
                        constructor = value.constructor;

                        if (constructor === Object) {
                            objectProperties.push(key);
                            propertyClassesMap[key] = ExtObject.classify(value);
                        }
                        else if (constructor === Array) {
                            arrayProperties.push(key);
                        }
                    }
                }
            }

            objectClass.prototype = object;

            return objectClass;
        },

        equals: function(origin, target) {
            var originType = typeof origin,
                targetType = typeof target,
                key;

            if (targetType === targetType) {
                if (originType === 'object') {
                    for (key in origin) {
                        if (!(key in target)) {
                            return false;
                        }

                        if (!ExtObject.equals(origin[key], target[key])) {
                            return false;
                        }
                    }

                    for (key in target) {
                        if (!(key in origin)) {
                            return false;
                        }
                    }

                    return true;
                }
                else {
                    return origin === target;
                }
            }

            return false;
        },
        defineProperty: ('defineProperty' in Object) ? Object.defineProperty : function(object, name, descriptor) {
            if (descriptor.get) {
                object.__defineGetter__(name, descriptor.get);
            }

            if (descriptor.set) {
                object.__defineSetter__(name, descriptor.set);
            }
        },
        clone: function(item) {
            if (item === null || item === undefined) {
                return item;
            }
    
            // DOM nodes
            if (item.nodeType && item.cloneNode) {
                return item.cloneNode(true);
            }
    
            // Strings
            var type = toString.call(item);
    
            // Dates
            if (type === '[object Date]') {
                return new Date(item.getTime());
            }
    
            var i, j, k, clone, key;
    
            // Arrays
            if (type === '[object Array]') {
                i = item.length;
    
                clone = [];
    
                while (i--) {
                    clone[i] = ExtObject.clone(item[i]);
                }
            }
            // Objects
            else if (type === '[object Object]' && item.constructor === Object) {
                clone = {};
    
                for (key in item) {
                    clone[key] = ExtObject.clone(item[key]);
                }
    
                if (enumerables) {
                    for (j = enumerables.length; j--;) {
                        k = enumerables[j];
                        clone[k] = item[k];
                    }
                }
            }
    
            return clone || item;
        },
        isEmpty: function(value, allowEmptyString) {
            return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (ExtObject.isArray(value) && value.length === 0);
        },
        isArray: ('isArray' in Array) ? Array.isArray : function(value) {
            return toString.call(value) === '[object Array]';
        },

        /**
         * Returns `true` if the passed value is a JavaScript Date object, `false` otherwise.
         * @param {Object} object The object to test.
         * @return {Boolean}
         */
        isDate: function(value) {
            return toString.call(value) === '[object Date]';
        },

        /**
         * Returns 'true' if the passed value is a String that matches the MS Date JSON encoding format
         * @param {String} value The string to test
         * @return {Boolean}
         */
        isMSDate: function(value) {
            if (!ExtObject.isString(value)) {
                return false;
            } else {
                return value.match("\\\\?/Date\\(([-+])?(\\d+)(?:[+-]\\d{4})?\\)\\\\?/") !== null;
            }
        },

        /**
         * Returns `true` if the passed value is a JavaScript Object, `false` otherwise.
         * @param {Object} value The value to test.
         * @return {Boolean}
         * @method
         */
        isObject: (toString.call(null) === '[object Object]') ?
            function(value) {
                // check ownerDocument here as well to exclude DOM nodes
                return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
            } :
            function(value) {
                return toString.call(value) === '[object Object]';
            },

        /**
         * @private
         */
        isSimpleObject: function(value) {
            return value instanceof Object && value.constructor === Object;
        },
        /**
         * Returns `true` if the passed value is a JavaScript 'primitive', a string, number or Boolean.
         * @param {Object} value The value to test.
         * @return {Boolean}
         */
        isPrimitive: function(value) {
            var type = typeof value;

            return type === 'string' || type === 'number' || type === 'boolean';
        },

        /**
         * Returns `true` if the passed value is a JavaScript Function, `false` otherwise.
         * @param {Object} value The value to test.
         * @return {Boolean}
         * @method
         */
        isFunction:
        // Safari 3.x and 4.x returns 'function' for typeof <NodeList>, hence we need to fall back to using
        // Object.prorotype.toString (slower)
            (typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function') ? function(value) {
                return toString.call(value) === '[object Function]';
            } : function(value) {
                return typeof value === 'function';
            },

        /**
         * Returns `true` if the passed value is a number. Returns `false` for non-finite numbers.
         * @param {Object} value The value to test.
         * @return {Boolean}
         */
        isNumber: function(value) {
            return typeof value === 'number' && isFinite(value);
        },

        /**
         * Validates that a value is numeric.
         * @param {Object} value Examples: 1, '1', '2.34'
         * @return {Boolean} `true` if numeric, `false` otherwise.
         */
        isNumeric: function(value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
        },

        /**
         * Returns `true` if the passed value is a string.
         * @param {Object} value The value to test.
         * @return {Boolean}
         */
        isString: function(value) {
            return typeof value === 'string';
        },

        /**
         * Returns `true` if the passed value is a Boolean.
         *
         * @param {Object} value The value to test.
         * @return {Boolean}
         */
        isBoolean: function(value) {
            return typeof value === 'boolean';
        },

        /**
         * Returns `true` if the passed value is an HTMLElement.
         * @param {Object} value The value to test.
         * @return {Boolean}
         */
        isElement: function(value) {
            return value ? value.nodeType === 1 : false;
        },

        /**
         * Returns `true` if the passed value is a TextNode.
         * @param {Object} value The value to test.
         * @return {Boolean}
         */
        isTextNode: function(value) {
            return value ? value.nodeName === "#text" : false;
        },

        /**
         * Returns `true` if the passed value is defined.
         * @param {Object} value The value to test.
         * @return {Boolean}
         */
        isDefined: function(value) {
            return typeof value !== 'undefined';
        },

        /**
         * Returns `true` if the passed value is iterable, `false` otherwise.
         * @param {Object} value The value to test.
         * @return {Boolean}
         */
        isIterable: function(value) {
            return (value && typeof value !== 'string') ? value.length !== undefined : false;
        }
    };

    /**
     * A convenient alias method for {@link ExtObject.Object#toQueryString}.
     *
     * @member Ext
     * @method urlEncode
     * @deprecated 2.0.0 Please use `{@link ExtObject.Object#toQueryString ExtObject.Object.toQueryString}` instead
     */
    ExtObject.urlEncode = function() {
        var args = ExtObject.Array.from(arguments),
            prefix = '';

        // Support for the old `pre` argument
        if ((typeof args[1] === 'string')) {
            prefix = args[1] + '&';
            args[1] = false;
        }

        return prefix + ExtObject.toQueryString.apply(ExtObject, args);
    };

    /**
     * A convenient alias method for {@link ExtObject.Object#fromQueryString}.
     *
     * @member Ext
     * @method urlDecode
     * @deprecated 2.0.0 Please use {@link ExtObject.Object#fromQueryString ExtObject.Object.fromQueryString} instead
     */
    ExtObject.urlDecode = function() {
        return ExtObject.fromQueryString.apply(ExtObject, arguments);
    };

module.exports = ExtObject;