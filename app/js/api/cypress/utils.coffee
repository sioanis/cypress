$Cypress.Utils = do ($Cypress, _) ->

  tagOpen     = /\[([a-z\s='"-]+)\]/g
  tagClosed   = /\[\/([a-z]+)\]/g

  CYPRESS_OBJECT_NAMESPACE = "_cypressObj"

  return {
    ## return a new object if the obj
    ## contains the properties of filter
    ## and the values are different
    filterDelta: (obj, filter) ->
      obj = _.reduce filter, (memo, value, key) ->
        if obj[key] isnt value
          memo[key] = obj[key]

        memo
      , {}

      if _.isEmpty(obj) then undefined else obj
    hasElement: (obj) ->
      try
        !!(obj and obj[0] and _.isElement(obj[0])) or _.isElement(obj)
      catch
        false

    ## short form css-inlines the element
    ## long form returns the outerHTML
    stringifyElement: (el, form = "long") ->
      el = if _.isElement(el) then $(el) else el

      switch form
        when "long"
          el.clone().empty().prop("outerHTML")
        when "short"
          str = el.prop("tagName").toLowerCase()
          if id = el.prop("id")
            str += "#" + id

          if klass = el.prop("class")
            str += "." + klass.split(/\s+/).join(".")

          "<#{str}>"

    plural: (obj, plural, singular) ->
      obj = if _.isNumber(obj) then obj else obj.length
      if obj > 1 then plural else singular

    convertHtmlTags: (html) ->
      html
        .replace(tagOpen, "<$1>")
        .replace(tagClosed, "</$1>")

    isInstanceOf: (instance, constructor) ->
      try
        instance instanceof constructor
      catch e
        false

    getCypressNamespace: (obj) ->
      obj and obj[CYPRESS_OBJECT_NAMESPACE]

    ## backs up an original object to another
    ## by going through the cypress object namespace
    setCypressNamespace: (obj, original) ->
      obj[CYPRESS_OBJECT_NAMESPACE] = original
  }