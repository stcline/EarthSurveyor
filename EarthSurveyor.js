var map;
require([
      "esri/map",
/* Additional Measurement script here */
      "esri/Color",
      "dojo/keys",
      "esri/config",
      "esri/sniff",
      "esri/SnappingManager",
      "esri/dijit/Measurement",
      "esri/renderers/SimpleRenderer",
      "esri/tasks/GeometryService",
      "esri/symbols/SimpleLineSymbol",
      "esri/symbols/SimpleFillSymbol",
      "esri/dijit/Scalebar",
      "dijit/TitlePane",    
/* cities with popups */ 
      "esri/geometry/Extent",  
      "esri/InfoTemplate",
/*  orignal script in the working map  */
      "esri/dijit/Search",
      "esri/arcgis/utils",
      "esri/dijit/Legend",
/* script for all maps */    
      "esri/layers/ArcGISTiledMapServiceLayer",
      "esri/layers/ArcGISDynamicMapServiceLayer",
      "esri/layers/FeatureLayer",
      "dojo/dom",
      "dojo/dom-construct",
      "dojo/parser",
      "dojo/_base/array",
      "esri/graphic",
      "esri/symbols/SimpleMarkerSymbol",
      "esri/geometry/screenUtils",
      "dojo/query",
      "dojo/_base/Color",
      "dijit/form/CheckBox",
      "dijit/layout/AccordionContainer",
      "dijit/layout/BorderContainer",
      "dijit/layout/ContentPane",
      "dojo/domReady!"
    ],

  function (
    Map,

    /* Additional script here for the Measurement tool */
    Color, keys, esriConfig, has, SnappingManager, Measurement, SimpleRenderer, GeometryService, SimpleLineSymbol, SimpleFillSymbol,
    Scalebar, TitlePane,
    /* cities popup */
    Extent, InfoTemplate, 
    /* original working script */
    Search, utils, Legend, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer,
    FeatureLayer,
    dom, domConstruct,
    parser, arrayUtils, Graphic, SimpleMarkerSymbol, screenUtils, query,
/*missing var*/
    dojoColor,
/*end missing var*/
    CheckBox
  ) {

    parser.parse();

    var legendLayers = [];

    map = new Map("map", {
      basemap: "topo",
      center: [10, 23],
      zoom: 2
    });

    /*  Additional script for the Measurement tool */

    var sfs = new SimpleFillSymbol(
      "solid",
      new SimpleLineSymbol("solid", new Color([195, 176, 23]), 2),
      null
    );

    //dojo.keys.copyKey maps to CTRL on windows and Cmd on Mac., but has wrong code for Chrome on Mac
    var snapManager = map.enableSnapping({
      snapKey: has("mac") ? keys.META : keys.CTRL
    });

    var layerInfos = [
/* This var does not exist in your code...
      {
        layer: parcelsLayer
      }
*/
    ];
    snapManager.setLayerInfos(layerInfos);

    var measurement = new Measurement({
      map: map
    }, dom.byId("measurementDiv"));
    measurement.startup();

    /* Original working script */

    var s = new Search({
      map: map
    }, "search");
    s.startup();

    // duplicate this for each layer - use dynamic layer service for those types
    var LADALandUse = new ArcGISTiledMapServiceLayer("http://tiles.arcgis.com/tiles/HVjI8GKrRtjcQ4Ry/arcgis/rest/services/Global_Land_Cover_Land_Use_Systems/MapServer", {
      id: "landuse"
    });

    legendLayers.push({
      layer: LADALandUse,
      title: "Land Use"
    });

    //         to here
    var popdens = new ArcGISTiledMapServiceLayer("http://tiles.arcgis.com/tiles/HVjI8GKrRtjcQ4Ry/arcgis/rest/services/Population_Density/MapServer", {
      id: "POPdens"
    });

    legendLayers.push({
      layer: popdens,
      title: "Population Density"
    });


    var WWFTerEco = new ArcGISTiledMapServiceLayer("http://tiles.arcgis.com/tiles/HVjI8GKrRtjcQ4Ry/arcgis/rest/services/WWF_Terrestrial_Ecoregions_Major_Habitat_Types_Tiles/MapServer", {
      id: "WWFTerEco"
    });

    legendLayers.push({
      layer: WWFTerEco,
      title: "WWF Terrestrial Ecoregion"
    });

    var Veg = new ArcGISTiledMapServiceLayer("http://tiles.arcgis.com/tiles/HVjI8GKrRtjcQ4Ry/arcgis/rest/services/5_min_Vegetation/MapServer", {
      id: "vegetation"
    });

    legendLayers.push({
      layer: Veg,
      title: "Vegetation"
    });

    var tempreg = new InfoTemplate("Region", "Region: ${REGION}");

    var regions = new FeatureLayer("http://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Regions/FeatureServer/0", {
      id: "regions",
      infoTemplate: tempreg    
    });

    legendLayers.push({
      layer: regions,
      title: "Regions"
    });
    
    var template = new InfoTemplate("Cities", "City: ${CITY_NAME}<br>Population: ${POP}");
    
    var Cities = new FeatureLayer("http://services3.arcgis.com/HVjI8GKrRtjcQ4Ry/arcgis/rest/services/Cities_over_100000/FeatureServer/0", {
      id: "Cities",
      infoTemplate: template,
      outFields: ["CITY_NAME"]    
    });

    legendLayers.push({
      layer: Cities,
      title: "Major Cities"
    });

    map.on("layers-add-result", function () {
      var legend = new Legend({
        map: map,
        layerInfos: legendLayers
      }, "legendDiv");
      legend.startup();
    });

    map.on("layers-add-result", function () {
      //add check boxes
      arrayUtils.forEach(legendLayers, function (layer) {
        var layerName = layer.title;
        var checkBox = new CheckBox({
          name: "checkBox" + layer.layer.id,
          value: layer.layer.id,
          checked: layer.layer.visible
        });

        checkBox.on("change", function () {
          var targetLayer = map.getLayer(this.value);
          targetLayer.setVisibility(!targetLayer.visible);
          this.checked = targetLayer.visible;
        });

        //add the check box and label to the toc
        domConstruct.place(checkBox.domNode, dom.byId("toggle"), "after");
        var checkLabel = domConstruct.create("label", {
          "for": checkBox.name,
          innerHTML: layerName
        }, checkBox.domNode, "after");
        domConstruct.place("<br />", checkLabel, "after");
      });
    });

    map.addLayers([LADALandUse, popdens, WWFTerEco, Veg, regions, Cities]); /*add the layer var here*/
  });
