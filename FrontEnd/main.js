var camera, globe;
var graticule, mesh;

var cameraRadius = 5;
const defaultRotation = new THREE.Vector3(
  -1.5700000000000005,
  0,
  -3.8163916471489756e-17
);

var displacementCamera = {x: 0, y: 0};

window.onload = function () {
    var scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, .1, 100);

    var renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(innerWidth, innerHeight);
    document.body.appendChild(renderer.domElement);

    var geometry = new THREE.SphereGeometry(1, 64, 64);
    var texture = new THREE.TextureLoader().load('earth.jpg');
    var depthMap = new THREE.TextureLoader().load("high-bump.jpg");
    var material = new THREE.MeshStandardMaterial({
        map: texture,
        // displacementMap: depthMap,
        // displacementScale: .08
    });
    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    var light = new THREE.AmbientLight( 0xFFFFFF ); // soft white light
    light.intensity = 2;
    scene.add( light );

    var radius = 1;

    scene.add((graticule = wireframe(graticule10(),new THREE.LineBasicMaterial({color: 0xaaaaaa}))));
    scene.add((mesh = wireframe(topojson.mesh(topology, topology.objects.countries),new THREE.LineBasicMaterial({color: 0xff0000}))));

    // Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
    function vertex(point) {
        var lambda = point[0] * Math.PI / 180,
            phi = point[1] * Math.PI / 180,
            cosPhi = Math.cos(phi);
        return new THREE.Vector3(
            radius * cosPhi * Math.cos(lambda),
            radius * cosPhi * Math.sin(lambda),
            radius * Math.sin(phi)
        );
    }

    // Converts a GeoJSON MultiLineString in spherical coordinates to a THREE.LineSegments.
    function wireframe(multilinestring, material) {
        var geometry = new THREE.Geometry;
        multilinestring.coordinates.forEach(function (line) {
            d3.pairs(line.map(vertex), function (a, b) {
                geometry.vertices.push(a, b);
            });
        });
        return new THREE.LineSegments(geometry, material);
    }

    // See https://github.com/d3/d3-geo/issues/95
    function graticule10() {
        var epsilon = 1e-6,
            x1 = 180,
            x0 = -x1,
            y1 = 80,
            y0 = -y1,
            dx = 10,
            dy = 10,
            X1 = 180,
            X0 = -X1,
            Y1 = 90,
            Y0 = -Y1,
            DX = 90,
            DY = 360,
            x = graticuleX(y0, y1, 2.5),
            y = graticuleY(x0, x1, 2.5),
            X = graticuleX(Y0, Y1, 2.5),
            Y = graticuleY(X0, X1, 2.5);

        function graticuleX(y0, y1, dy) {
            var y = d3.range(y0, y1 - epsilon, dy).concat(y1);
            return function (x) {
                return y.map(function (y) {
                    return [x, y];
                });
            };
        }

        function graticuleY(x0, x1, dx) {
            var x = d3.range(x0, x1 - epsilon, dx).concat(x1);
            return function (y) {
                return x.map(function (x) {
                    return [x, y];
                });
            };
        }

        return {
            type: "MultiLineString",
            coordinates: d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X)
                .concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y))
                .concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function (x) {
                    return Math.abs(x % DX) > epsilon;
                }).map(x))
                .concat(d3.range(Math.ceil(y0 / dy) * dy, y1 + epsilon, dy).filter(function (y) {
                    return Math.abs(y % DY) > epsilon;
                }).map(y))
        };
    }

    

    graticule.rotation.setFromVector3(defaultRotation);
    mesh.rotation.setFromVector3(defaultRotation);

    camera.position.z = cameraRadius;

    //Draw Scene
    var Logic = function () {
        
        if(InputState.isDragging) {
            var displacement = InputState.displacement.get();
            
            displacementCamera.x += displacement.x / 500;
            displacementCamera.y -= displacement.y / 500;

        }

        if(InputState.isScrolling) {
            var scroll = InputState.scrolling.get();
            cameraRadius += scroll.y/1000;
        }



        //Putting limits
        displacementCamera.y = clamp(displacementCamera.y, 0.000001, Math.PI);
        cameraRadius = clamp(cameraRadius, 1.2, 4)

        //Vectors should be (X, Z, Y)
        camera.position.x = cameraRadius * Math.cos(displacementCamera.x) * Math.sin(displacementCamera.y);
        camera.position.z = cameraRadius * Math.sin(displacementCamera.x) * Math.sin(displacementCamera.y);
        camera.position.y = cameraRadius * Math.cos(displacementCamera.y);

        //Make the camera always look at the center
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        
    };

    //Run loop (logic, render, repeat)
    var Render = function () {
        requestAnimationFrame(Render);
        Logic();
        renderer.render(scene, camera);
    };

    Render();


    //---------------------------------------------------------------
    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(innerWidth, innerHeight);
    }
}


var topology = {
    "type": "Topology",
    "objects": {
        "countries": {
            "type": "GeometryCollection",
            "geometries": [{
                "type": "Polygon",
                "arcs": [
                    [0, 1, 2, 3, 4, 5]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 28400000,
                    "mapcolor7": 5,
                    "continent": "Asia",
                    "economy": "7. Least developed region",
                    "mapcolor13": 7,
                    "iso_a3": "AFG",
                    "name": "Afghanistan",
                    "mapcolor9": 8
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [6, 7, 8, 9]
                    ],
                    [
                        [10, 11, 12]
                    ]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 12799293,
                    "mapcolor7": 3,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 1,
                    "iso_a3": "AGO",
                    "name": "Angola",
                    "mapcolor9": 6
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [13, 14, 15, 16, 17, 18]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 3639453,
                    "mapcolor7": 1,
                    "continent": "Europe",
                    "economy": "6. Developing region",
                    "mapcolor13": 6,
                    "iso_a3": "ALB",
                    "name": "Albania",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [19, 20, 21, 22, 23]
                ],
                "properties": {
                    "income_grp": "2. High income: nonOECD",
                    "pop_est": 4798491,
                    "mapcolor7": 2,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 3,
                    "iso_a3": "ARE",
                    "name": "United Arab Emirates",
                    "mapcolor9": 3
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [24, 25]
                    ],
                    [
                        [26, 27, 28, 29, 30, 31]
                    ]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 40913584,
                    "mapcolor7": 3,
                    "continent": "South America",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 13,
                    "iso_a3": "ARG",
                    "name": "Argentina",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [32, 33, 34, 35, 36]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 2967004,
                    "mapcolor7": 3,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 10,
                    "iso_a3": "ARM",
                    "name": "Armenia",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [37]
                ],
                "properties": {
                    "income_grp": "2. High income: nonOECD",
                    "pop_est": 140,
                    "mapcolor7": 7,
                    "continent": "Seven seas (open ocean)",
                    "economy": "6. Developing region",
                    "mapcolor13": 11,
                    "iso_a3": "ATF",
                    "name": "Fr. S. Antarctic Lands",
                    "mapcolor9": 9
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [38]
                    ],
                    [
                        [39]
                    ]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 21262641,
                    "mapcolor7": 1,
                    "continent": "Oceania",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 7,
                    "iso_a3": "AUS",
                    "name": "Australia",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [40, 41, 42, 43, 44, 45, 46]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 8210281,
                    "mapcolor7": 3,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 4,
                    "iso_a3": "AUT",
                    "name": "Austria",
                    "mapcolor9": 3
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [47, -34]
                    ],
                    [
                        [48, 49, -37, 50, 51]
                    ]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 8238672,
                    "mapcolor7": 1,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 8,
                    "iso_a3": "AZE",
                    "name": "Azerbaijan",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [52, 53, 54, 55, 56]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 8988091,
                    "mapcolor7": 2,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 8,
                    "iso_a3": "BDI",
                    "name": "Burundi",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [57, 58, 59, 60, 61, 62]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 10414336,
                    "mapcolor7": 3,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 8,
                    "iso_a3": "BEL",
                    "name": "Belgium",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [63, 64, 65, 66, 67]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 8791832,
                    "mapcolor7": 1,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 12,
                    "iso_a3": "BEN",
                    "name": "Benin",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [68, -67, 69, 70, 71, 72]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 15746232,
                    "mapcolor7": 2,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 11,
                    "iso_a3": "BFA",
                    "name": "Burkina Faso",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [73, 74, 75]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 156050883,
                    "mapcolor7": 3,
                    "continent": "Asia",
                    "economy": "7. Least developed region",
                    "mapcolor13": 7,
                    "iso_a3": "BGD",
                    "name": "Bangladesh",
                    "mapcolor9": 7
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [76, 77, 78, 79, 80, 81]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 7204687,
                    "mapcolor7": 4,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 8,
                    "iso_a3": "BGR",
                    "name": "Bulgaria",
                    "mapcolor9": 1
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [82]
                    ],
                    [
                        [83]
                    ],
                    [
                        [84]
                    ]
                ],
                "properties": {
                    "income_grp": "2. High income: nonOECD",
                    "pop_est": 309156,
                    "mapcolor7": 1,
                    "continent": "North America",
                    "economy": "6. Developing region",
                    "mapcolor13": 5,
                    "iso_a3": "BHS",
                    "name": "Bahamas",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [85, 86, 87]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 4613414,
                    "mapcolor7": 1,
                    "continent": "Europe",
                    "economy": "6. Developing region",
                    "mapcolor13": 2,
                    "iso_a3": "BIH",
                    "name": "Bosnia and Herz.",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [88, 89, 90, 91, 92]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 9648533,
                    "mapcolor7": 1,
                    "continent": "Europe",
                    "economy": "6. Developing region",
                    "mapcolor13": 11,
                    "iso_a3": "BLR",
                    "name": "Belarus",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [93, 94, 95]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 307899,
                    "mapcolor7": 1,
                    "continent": "North America",
                    "economy": "6. Developing region",
                    "mapcolor13": 7,
                    "iso_a3": "BLZ",
                    "name": "Belize",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [96, -32, 97, 98, 99]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 9775246,
                    "mapcolor7": 1,
                    "continent": "South America",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 3,
                    "iso_a3": "BOL",
                    "name": "Bolivia",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [100, 101, 102, 103, -28, 104, -100, 105, 106, 107, 108]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 198739269,
                    "mapcolor7": 5,
                    "continent": "South America",
                    "economy": "3. Emerging region: BRIC",
                    "mapcolor13": 7,
                    "iso_a3": "BRA",
                    "name": "Brazil",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [109, 110]
                ],
                "properties": {
                    "income_grp": "2. High income: nonOECD",
                    "pop_est": 388190,
                    "mapcolor7": 4,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 12,
                    "iso_a3": "BRN",
                    "name": "Brunei",
                    "mapcolor9": 6
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [111, 112]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 691141,
                    "mapcolor7": 5,
                    "continent": "Asia",
                    "economy": "7. Least developed region",
                    "mapcolor13": 8,
                    "iso_a3": "BTN",
                    "name": "Bhutan",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [113, 114, 115, 116]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 1990876,
                    "mapcolor7": 6,
                    "continent": "Africa",
                    "economy": "6. Developing region",
                    "mapcolor13": 3,
                    "iso_a3": "BWA",
                    "name": "Botswana",
                    "mapcolor9": 7
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [117, 118, 119, 120, 121, 122]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 4511488,
                    "mapcolor7": 5,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 9,
                    "iso_a3": "CAF",
                    "name": "Central African Rep.",
                    "mapcolor9": 6
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [123]
                    ],
                    [
                        [124]
                    ],
                    [
                        [125]
                    ],
                    [
                        [126]
                    ],
                    [
                        [127]
                    ],
                    [
                        [128]
                    ],
                    [
                        [129]
                    ],
                    [
                        [130]
                    ],
                    [
                        [131]
                    ],
                    [
                        [132]
                    ],
                    [
                        [133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147]
                    ],
                    [
                        [148]
                    ],
                    [
                        [149]
                    ],
                    [
                        [150]
                    ],
                    [
                        [151]
                    ],
                    [
                        [152]
                    ],
                    [
                        [153]
                    ],
                    [
                        [154]
                    ],
                    [
                        [155]
                    ],
                    [
                        [156]
                    ],
                    [
                        [157]
                    ],
                    [
                        [158]
                    ],
                    [
                        [159]
                    ],
                    [
                        [160]
                    ],
                    [
                        [161]
                    ],
                    [
                        [162]
                    ],
                    [
                        [163]
                    ],
                    [
                        [164]
                    ],
                    [
                        [165]
                    ],
                    [
                        [166]
                    ]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 33487208,
                    "mapcolor7": 6,
                    "continent": "North America",
                    "economy": "1. Developed region: G7",
                    "mapcolor13": 2,
                    "iso_a3": "CAN",
                    "name": "Canada",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-45, 167, 168, 169]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 7604467,
                    "mapcolor7": 5,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 3,
                    "iso_a3": "CHE",
                    "name": "Switzerland",
                    "mapcolor9": 7
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [-25, 170]
                    ],
                    [
                        [-31, 171, 172, -98]
                    ]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 16601707,
                    "mapcolor7": 5,
                    "continent": "South America",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 9,
                    "iso_a3": "CHL",
                    "name": "Chile",
                    "mapcolor9": 5
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [173]
                    ],
                    [
                        [174, 175, 176, 177, 178, 179, 180, 181, 182, 183, -113, 184, 185, 186, 187, -1, 188, 189, 190, 191, 192, 193, 194, 195]
                    ]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 1338612970,
                    "mapcolor7": 4,
                    "continent": "Asia",
                    "economy": "3. Emerging region: BRIC",
                    "mapcolor13": 3,
                    "iso_a3": "CHN",
                    "name": "China",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-72, 196, 197, 198, 199, 200]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 20617068,
                    "mapcolor7": 4,
                    "continent": "Africa",
                    "economy": "6. Developing region",
                    "mapcolor13": 3,
                    "iso_a3": "CIV",
                    "name": "C�te d'Ivoire",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-121, 201, 202, 203, 204, 205, 206, 207]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 18879301,
                    "mapcolor7": 1,
                    "continent": "Africa",
                    "economy": "6. Developing region",
                    "mapcolor13": 3,
                    "iso_a3": "CMR",
                    "name": "Cameroon",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [208, 209, 210, -55, 211, 212, -10, 213, -13, 214, -119]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 68692542,
                    "mapcolor7": 4,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 7,
                    "iso_a3": "COD",
                    "name": "Dem. Rep. Congo",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-215, -12, 215, 216, -202, -120]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 4012809,
                    "mapcolor7": 2,
                    "continent": "Africa",
                    "economy": "6. Developing region",
                    "mapcolor13": 10,
                    "iso_a3": "COG",
                    "name": "Congo",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [217, -107, 218, 219, 220, 221, 222]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 45644023,
                    "mapcolor7": 2,
                    "continent": "South America",
                    "economy": "6. Developing region",
                    "mapcolor13": 1,
                    "iso_a3": "COL",
                    "name": "Colombia",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [223, 224, 225, 226]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 4253877,
                    "mapcolor7": 3,
                    "continent": "North America",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 2,
                    "iso_a3": "CRI",
                    "name": "Costa Rica",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [227]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 11451652,
                    "mapcolor7": 3,
                    "continent": "North America",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 4,
                    "iso_a3": "CUB",
                    "name": "Cuba",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [228, 229]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 265100,
                    "mapcolor7": 3,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 8,
                    "iso_a3": "-99",
                    "name": "N. Cyprus",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [230, -229]
                ],
                "properties": {
                    "income_grp": "2. High income: nonOECD",
                    "pop_est": 531640,
                    "mapcolor7": 1,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 7,
                    "iso_a3": "CYP",
                    "name": "Cyprus",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [231, 232, -47, 233]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 10211904,
                    "mapcolor7": 1,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 6,
                    "iso_a3": "CZE",
                    "name": "Czech Rep.",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [234, -234, -46, -170, 235, 236, -58, 237, 238, 239, 240]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 82329758,
                    "mapcolor7": 2,
                    "continent": "Europe",
                    "economy": "1. Developed region: G7",
                    "mapcolor13": 1,
                    "iso_a3": "DEU",
                    "name": "Germany",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [241, 242, 243, 244]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 516055,
                    "mapcolor7": 1,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 8,
                    "iso_a3": "DJI",
                    "name": "Djibouti",
                    "mapcolor9": 4
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [245]
                    ],
                    [
                        [-240, 246]
                    ]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 5500510,
                    "mapcolor7": 4,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 12,
                    "iso_a3": "DNK",
                    "name": "Denmark",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [247, 248]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 9650054,
                    "mapcolor7": 5,
                    "continent": "North America",
                    "economy": "6. Developing region",
                    "mapcolor13": 7,
                    "iso_a3": "DOM",
                    "name": "Dominican Rep.",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [249, 250, 251, 252, 253, 254, 255, 256]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 34178188,
                    "mapcolor7": 5,
                    "continent": "Africa",
                    "economy": "6. Developing region",
                    "mapcolor13": 3,
                    "iso_a3": "DZA",
                    "name": "Algeria",
                    "mapcolor9": 6
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [257, 258, -220]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 14573101,
                    "mapcolor7": 1,
                    "continent": "South America",
                    "economy": "6. Developing region",
                    "mapcolor13": 12,
                    "iso_a3": "ECU",
                    "name": "Ecuador",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [259, 260, 261, 262, 263, 264, 265]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 83082869,
                    "mapcolor7": 4,
                    "continent": "Africa",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 2,
                    "iso_a3": "EGY",
                    "name": "Egypt",
                    "mapcolor9": 7
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-244, 266, 267, 268, 269, 270]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 5647168,
                    "mapcolor7": 3,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 12,
                    "iso_a3": "ERI",
                    "name": "Eritrea",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [271, 272, 273, 274]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 40525002,
                    "mapcolor7": 4,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 5,
                    "iso_a3": "ESP",
                    "name": "Spain",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [275, 276, 277]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 1299371,
                    "mapcolor7": 3,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 10,
                    "iso_a3": "EST",
                    "name": "Estonia",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-243, 278, 279, 280, 281, 282, -267]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 85237338,
                    "mapcolor7": 4,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 13,
                    "iso_a3": "ETH",
                    "name": "Ethiopia",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [283, 284, 285, 286]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 5250275,
                    "mapcolor7": 4,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 6,
                    "iso_a3": "FIN",
                    "name": "Finland",
                    "mapcolor9": 4
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [287]
                    ],
                    [
                        [288]
                    ],
                    [
                        [289]
                    ]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 944720,
                    "mapcolor7": 5,
                    "continent": "Oceania",
                    "economy": "6. Developing region",
                    "mapcolor13": 2,
                    "iso_a3": "FJI",
                    "name": "Fiji",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [290]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 3140,
                    "mapcolor7": 6,
                    "continent": "South America",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 3,
                    "iso_a3": "FLK",
                    "name": "Falkland Is.",
                    "mapcolor9": 6
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [291, 292, 293, -102]
                    ],
                    [
                        [294]
                    ],
                    [
                        [295, -236, -169, 296, 297, -272, 298, -60]
                    ]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 64057792,
                    "mapcolor7": 7,
                    "continent": "Europe",
                    "economy": "1. Developed region: G7",
                    "mapcolor13": 11,
                    "iso_a3": "FRA",
                    "name": "France",
                    "mapcolor9": 9
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-217, 299, 300, -203]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 1514993,
                    "mapcolor7": 6,
                    "continent": "Africa",
                    "economy": "6. Developing region",
                    "mapcolor13": 5,
                    "iso_a3": "GAB",
                    "name": "Gabon",
                    "mapcolor9": 5
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [301, 302]
                    ],
                    [
                        [303]
                    ]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 62262000,
                    "mapcolor7": 6,
                    "continent": "Europe",
                    "economy": "1. Developed region: G7",
                    "mapcolor13": 3,
                    "iso_a3": "GBR",
                    "name": "United Kingdom",
                    "mapcolor9": 6
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [304, 305, -51, -36, 306, 307, 308]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 4615807,
                    "mapcolor7": 5,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 2,
                    "iso_a3": "GEO",
                    "name": "Georgia",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [309, 310, -197, -71]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 23832495,
                    "mapcolor7": 5,
                    "continent": "Africa",
                    "economy": "6. Developing region",
                    "mapcolor13": 4,
                    "iso_a3": "GHA",
                    "name": "Ghana",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [311, -200, 312, 313, 314, 315, 316]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 10057975,
                    "mapcolor7": 6,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 2,
                    "iso_a3": "GIN",
                    "name": "Guinea",
                    "mapcolor9": 7
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [317, 318]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 1782893,
                    "mapcolor7": 1,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 8,
                    "iso_a3": "GMB",
                    "name": "Gambia",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-316, 319, 320]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 1533964,
                    "mapcolor7": 3,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 4,
                    "iso_a3": "GNB",
                    "name": "Guinea-Bissau",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-301, 321, -204]
                ],
                "properties": {
                    "income_grp": "2. High income: nonOECD",
                    "pop_est": 650702,
                    "mapcolor7": 4,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 8,
                    "iso_a3": "GNQ",
                    "name": "Eq. Guinea",
                    "mapcolor9": 4
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [322]
                    ],
                    [
                        [323, -17, 324, -79, 325]
                    ]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 10737428,
                    "mapcolor7": 2,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 9,
                    "iso_a3": "GRC",
                    "name": "Greece",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [326]
                ],
                "properties": {
                    "income_grp": "2. High income: nonOECD",
                    "pop_est": 57600,
                    "mapcolor7": 4,
                    "continent": "North America",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 12,
                    "iso_a3": "GRL",
                    "name": "Greenland",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-94, 327, 328, 329, 330, 331]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 13276517,
                    "mapcolor7": 3,
                    "continent": "North America",
                    "economy": "6. Developing region",
                    "mapcolor13": 6,
                    "iso_a3": "GTM",
                    "name": "Guatemala",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [332, -109, 333, 334]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 772298,
                    "mapcolor7": 3,
                    "continent": "South America",
                    "economy": "6. Developing region",
                    "mapcolor13": 8,
                    "iso_a3": "GUY",
                    "name": "Guyana",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [335, 336, 337, -329, 338]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 7792854,
                    "mapcolor7": 2,
                    "continent": "North America",
                    "economy": "6. Developing region",
                    "mapcolor13": 5,
                    "iso_a3": "HND",
                    "name": "Honduras",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [339, -88, 340, 341, 342, 343]
                ],
                "properties": {
                    "income_grp": "2. High income: nonOECD",
                    "pop_est": 4489409,
                    "mapcolor7": 5,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 1,
                    "iso_a3": "HRV",
                    "name": "Croatia",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-248, 344]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 9035536,
                    "mapcolor7": 2,
                    "continent": "North America",
                    "economy": "7. Least developed region",
                    "mapcolor13": 2,
                    "iso_a3": "HTI",
                    "name": "Haiti",
                    "mapcolor9": 7
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [345, 346, 347, -344, 348, -42, 349]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 9905596,
                    "mapcolor7": 4,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 5,
                    "iso_a3": "HUN",
                    "name": "Hungary",
                    "mapcolor9": 1
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [350]
                    ],
                    [
                        [351, 352]
                    ],
                    [
                        [353]
                    ],
                    [
                        [354]
                    ],
                    [
                        [355]
                    ],
                    [
                        [356]
                    ],
                    [
                        [357]
                    ],
                    [
                        [358]
                    ],
                    [
                        [359, 360]
                    ],
                    [
                        [361]
                    ],
                    [
                        [362]
                    ],
                    [
                        [363, 364]
                    ],
                    [
                        [365]
                    ]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 240271522,
                    "mapcolor7": 6,
                    "continent": "Asia",
                    "economy": "4. Emerging region: MIKT",
                    "mapcolor13": 11,
                    "iso_a3": "IDN",
                    "name": "Indonesia",
                    "mapcolor9": 6
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [366, -185, -112, -184, 367, -76, 368, 369, -187]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 1166079220,
                    "mapcolor7": 1,
                    "continent": "Asia",
                    "economy": "3. Emerging region: BRIC",
                    "mapcolor13": 2,
                    "iso_a3": "IND",
                    "name": "India",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [370, -302]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 4203200,
                    "mapcolor7": 2,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 2,
                    "iso_a3": "IRL",
                    "name": "Ireland",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-33, -50, 371, 372, -3, 373, 374, 375, 376, -48]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 66429284,
                    "mapcolor7": 4,
                    "continent": "Asia",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 13,
                    "iso_a3": "IRN",
                    "name": "Iran",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-376, 377, 378, 379, 380, 381, 382]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 31129225,
                    "mapcolor7": 1,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 1,
                    "iso_a3": "IRQ",
                    "name": "Iraq",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [383]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 306694,
                    "mapcolor7": 1,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 9,
                    "iso_a3": "ISL",
                    "name": "Iceland",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [384, 385, 386, 387, -262, 388, 259, 389, 390]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 7233701,
                    "mapcolor7": 3,
                    "continent": "Asia",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 9,
                    "iso_a3": "ISR",
                    "name": "Israel",
                    "mapcolor9": 5
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [391]
                    ],
                    [
                        [392]
                    ],
                    [
                        [393, 394, -297, -168, -44]
                    ]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 58126212,
                    "mapcolor7": 6,
                    "continent": "Europe",
                    "economy": "1. Developed region: G7",
                    "mapcolor13": 7,
                    "iso_a3": "ITA",
                    "name": "Italy",
                    "mapcolor9": 8
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [395]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 2825928,
                    "mapcolor7": 1,
                    "continent": "North America",
                    "economy": "6. Developing region",
                    "mapcolor13": 10,
                    "iso_a3": "JAM",
                    "name": "Jamaica",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [396, 397, -388, 398, -386, 399, -381]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 6342948,
                    "mapcolor7": 5,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 4,
                    "iso_a3": "JOR",
                    "name": "Jordan",
                    "mapcolor9": 4
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [400]
                    ],
                    [
                        [401]
                    ],
                    [
                        [402]
                    ]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 127078679,
                    "mapcolor7": 5,
                    "continent": "Asia",
                    "economy": "1. Developed region: G7",
                    "mapcolor13": 4,
                    "iso_a3": "JPN",
                    "name": "Japan",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-191, 403, 404, 405, 406, 407, 408]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 15399437,
                    "mapcolor7": 6,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 1,
                    "iso_a3": "KAZ",
                    "name": "Kazakhstan",
                    "mapcolor9": 6
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [409, 410, 411, 412, 413, 414, -281]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 39002772,
                    "mapcolor7": 5,
                    "continent": "Africa",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 3,
                    "iso_a3": "KEN",
                    "name": "Kenya",
                    "mapcolor9": 7
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-190, 415, 416, -404]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 5431747,
                    "mapcolor7": 5,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 6,
                    "iso_a3": "KGZ",
                    "name": "Kyrgyzstan",
                    "mapcolor9": 7
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [417, 418, 419, 420]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 14494293,
                    "mapcolor7": 6,
                    "continent": "Asia",
                    "economy": "7. Least developed region",
                    "mapcolor13": 5,
                    "iso_a3": "KHM",
                    "name": "Cambodia",
                    "mapcolor9": 6
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [421, 422]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 48508972,
                    "mapcolor7": 4,
                    "continent": "Asia",
                    "economy": "4. Emerging region: MIKT",
                    "mapcolor13": 5,
                    "iso_a3": "KOR",
                    "name": "Korea",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [423, -15, 424, 425]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 1804838,
                    "mapcolor7": 2,
                    "continent": "Europe",
                    "economy": "6. Developing region",
                    "mapcolor13": 11,
                    "iso_a3": "-99",
                    "name": "Kosovo",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [426, 427, -379]
                ],
                "properties": {
                    "income_grp": "2. High income: nonOECD",
                    "pop_est": 2691158,
                    "mapcolor7": 2,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 2,
                    "iso_a3": "KWT",
                    "name": "Kuwait",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-421, 428, 429, -182, 430]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 6834942,
                    "mapcolor7": 1,
                    "continent": "Asia",
                    "economy": "7. Least developed region",
                    "mapcolor13": 9,
                    "iso_a3": "LAO",
                    "name": "Lao PDR",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-391, 431, 432]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 4017095,
                    "mapcolor7": 4,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 12,
                    "iso_a3": "LBN",
                    "name": "Lebanon",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-199, 433, 434, -313]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 3441790,
                    "mapcolor7": 2,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 9,
                    "iso_a3": "LBR",
                    "name": "Liberia",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-265, 435, 436, 437, -251, 438, 439]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 6310434,
                    "mapcolor7": 1,
                    "continent": "Africa",
                    "economy": "6. Developing region",
                    "mapcolor13": 11,
                    "iso_a3": "LBY",
                    "name": "Libya",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [440]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 21324791,
                    "mapcolor7": 3,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 9,
                    "iso_a3": "LKA",
                    "name": "Sri Lanka",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [441]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 2130819,
                    "mapcolor7": 1,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 8,
                    "iso_a3": "LSO",
                    "name": "Lesotho",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-91, 442, 443, 444, 445]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 3555179,
                    "mapcolor7": 6,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 9,
                    "iso_a3": "LTU",
                    "name": "Lithuania",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-296, -59, -237]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 491775,
                    "mapcolor7": 1,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 7,
                    "iso_a3": "LUX",
                    "name": "Luxembourg",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [446, -92, -446, 447, -277]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 2231503,
                    "mapcolor7": 4,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 13,
                    "iso_a3": "LVA",
                    "name": "Latvia",
                    "mapcolor9": 6
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-256, 448, 449]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 34859364,
                    "mapcolor7": 2,
                    "continent": "Africa",
                    "economy": "6. Developing region",
                    "mapcolor13": 9,
                    "iso_a3": "MAR",
                    "name": "Morocco",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [450, 451]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 4320748,
                    "mapcolor7": 3,
                    "continent": "Europe",
                    "economy": "6. Developing region",
                    "mapcolor13": 12,
                    "iso_a3": "MDA",
                    "name": "Moldova",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [452]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 20653556,
                    "mapcolor7": 6,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 3,
                    "iso_a3": "MDG",
                    "name": "Madagascar",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [453, -95, -332, 454, 455]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 111211789,
                    "mapcolor7": 6,
                    "continent": "North America",
                    "economy": "4. Emerging region: MIKT",
                    "mapcolor13": 3,
                    "iso_a3": "MEX",
                    "name": "Mexico",
                    "mapcolor9": 7
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-325, -16, -424, 456, -80]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 2066718,
                    "mapcolor7": 5,
                    "continent": "Europe",
                    "economy": "6. Developing region",
                    "mapcolor13": 3,
                    "iso_a3": "MKD",
                    "name": "Macedonia",
                    "mapcolor9": 7
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [457, -73, -201, -312, 458, 459, -253]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 12666987,
                    "mapcolor7": 1,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 7,
                    "iso_a3": "MLI",
                    "name": "Mali",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-430, 460, 461, -74, -368, -183]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 48137741,
                    "mapcolor7": 2,
                    "continent": "Asia",
                    "economy": "7. Least developed region",
                    "mapcolor13": 13,
                    "iso_a3": "MMR",
                    "name": "Myanmar",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-425, -14, 462, 463, -341, -87, 464]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 672180,
                    "mapcolor7": 4,
                    "continent": "Europe",
                    "economy": "6. Developing region",
                    "mapcolor13": 5,
                    "iso_a3": "MNE",
                    "name": "Montenegro",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-193, 465]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 3041142,
                    "mapcolor7": 3,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 6,
                    "iso_a3": "MNG",
                    "name": "Mongolia",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [466, 467, 468, 469, 470, 471, 472, 473, 474, 475]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 21669278,
                    "mapcolor7": 4,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 4,
                    "iso_a3": "MOZ",
                    "name": "Mozambique",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-460, 476, 477, 478, -254]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 3129486,
                    "mapcolor7": 3,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 1,
                    "iso_a3": "MRT",
                    "name": "Mauritania",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-472, 479, 480, 481]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 14268711,
                    "mapcolor7": 1,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 5,
                    "iso_a3": "MWI",
                    "name": "Malawi",
                    "mapcolor9": 4
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [482, 483]
                    ],
                    [
                        [-364, 484, -111, 485]
                    ]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 25715819,
                    "mapcolor7": 2,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 6,
                    "iso_a3": "MYS",
                    "name": "Malaysia",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [486, -116, 487, 488, -8]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 2108665,
                    "mapcolor7": 4,
                    "continent": "Africa",
                    "economy": "6. Developing region",
                    "mapcolor13": 7,
                    "iso_a3": "NAM",
                    "name": "Namibia",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [489]
                ],
                "properties": {
                    "income_grp": "2. High income: nonOECD",
                    "pop_est": 227436,
                    "mapcolor7": 7,
                    "continent": "Oceania",
                    "economy": "6. Developing region",
                    "mapcolor13": 11,
                    "iso_a3": "NCL",
                    "name": "New Caledonia",
                    "mapcolor9": 9
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [490, -207, 491, -68, -69, -458, -252, -438]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 15306252,
                    "mapcolor7": 4,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 13,
                    "iso_a3": "NER",
                    "name": "Niger",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-206, 492, -64, -492]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 149229090,
                    "mapcolor7": 3,
                    "continent": "Africa",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 2,
                    "iso_a3": "NGA",
                    "name": "Nigeria",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [493, -227, 494, -336]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 5891199,
                    "mapcolor7": 1,
                    "continent": "North America",
                    "economy": "6. Developing region",
                    "mapcolor13": 9,
                    "iso_a3": "NIC",
                    "name": "Nicaragua",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-63, 495, 496, -238]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 16715999,
                    "mapcolor7": 4,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 9,
                    "iso_a3": "NLD",
                    "name": "Netherlands",
                    "mapcolor9": 2
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [497, 498, -287, 499, 500]
                    ],
                    [
                        [501]
                    ],
                    [
                        [502]
                    ],
                    [
                        [503]
                    ]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 4676305,
                    "mapcolor7": 5,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 12,
                    "iso_a3": "NOR",
                    "name": "Norway",
                    "mapcolor9": 8
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-367, -186]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 28563377,
                    "mapcolor7": 2,
                    "continent": "Asia",
                    "economy": "7. Least developed region",
                    "mapcolor13": 12,
                    "iso_a3": "NPL",
                    "name": "Nepal",
                    "mapcolor9": 3
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [504]
                    ],
                    [
                        [505]
                    ]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 4213418,
                    "mapcolor7": 3,
                    "continent": "Oceania",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 4,
                    "iso_a3": "NZL",
                    "name": "New Zealand",
                    "mapcolor9": 4
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [506, 507, -21, 508]
                    ],
                    [
                        [-24, 509]
                    ]
                ],
                "properties": {
                    "income_grp": "2. High income: nonOECD",
                    "pop_est": 3418085,
                    "mapcolor7": 1,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 6,
                    "iso_a3": "OMN",
                    "name": "Oman",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-370, 510, -374, -2, -188]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 176242949,
                    "mapcolor7": 2,
                    "continent": "Asia",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 11,
                    "iso_a3": "PAK",
                    "name": "Pakistan",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-222, 511, -225, 512]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 3360474,
                    "mapcolor7": 4,
                    "continent": "North America",
                    "economy": "6. Developing region",
                    "mapcolor13": 3,
                    "iso_a3": "PAN",
                    "name": "Panama",
                    "mapcolor9": 6
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-106, -99, -173, 513, -258, -219]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 29546963,
                    "mapcolor7": 4,
                    "continent": "South America",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 11,
                    "iso_a3": "PER",
                    "name": "Peru",
                    "mapcolor9": 4
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [514]
                    ],
                    [
                        [515]
                    ],
                    [
                        [516]
                    ],
                    [
                        [517]
                    ],
                    [
                        [518]
                    ],
                    [
                        [519]
                    ],
                    [
                        [520]
                    ]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 97976603,
                    "mapcolor7": 3,
                    "continent": "Asia",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 8,
                    "iso_a3": "PHL",
                    "name": "Philippines",
                    "mapcolor9": 2
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [521]
                    ],
                    [
                        [522]
                    ],
                    [
                        [-360, 523]
                    ],
                    [
                        [524]
                    ]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 6057263,
                    "mapcolor7": 4,
                    "continent": "Oceania",
                    "economy": "6. Developing region",
                    "mapcolor13": 1,
                    "iso_a3": "PNG",
                    "name": "Papua New Guinea",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [525, -443, -90, 526, 527, -232, -235, 528]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 38482919,
                    "mapcolor7": 3,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 2,
                    "iso_a3": "POL",
                    "name": "Poland",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [529]
                ],
                "properties": {
                    "income_grp": "2. High income: nonOECD",
                    "pop_est": 3971020,
                    "mapcolor7": 4,
                    "continent": "North America",
                    "economy": "6. Developing region",
                    "mapcolor13": 1,
                    "iso_a3": "PRI",
                    "name": "Puerto Rico",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [530, 531, -422, 532, -179, -178]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 22665345,
                    "mapcolor7": 3,
                    "continent": "Asia",
                    "economy": "7. Least developed region",
                    "mapcolor13": 9,
                    "iso_a3": "PRK",
                    "name": "Dem. Rep. Korea",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [533, -274]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 10707924,
                    "mapcolor7": 1,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 4,
                    "iso_a3": "PRT",
                    "name": "Portugal",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-105, -27, -97]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 6995655,
                    "mapcolor7": 6,
                    "continent": "South America",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 2,
                    "iso_a3": "PRY",
                    "name": "Paraguay",
                    "mapcolor9": 6
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-399, -387]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 4119083,
                    "mapcolor7": 3,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 8,
                    "iso_a3": "PSE",
                    "name": "Palestine",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [534, 535]
                ],
                "properties": {
                    "income_grp": "2. High income: nonOECD",
                    "pop_est": 833285,
                    "mapcolor7": 3,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 4,
                    "iso_a3": "QAT",
                    "name": "Qatar",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-451, 536, 537, -82, 538, -347, 539]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 22215421,
                    "mapcolor7": 1,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 13,
                    "iso_a3": "ROU",
                    "name": "Romania",
                    "mapcolor9": 3
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [540]
                    ],
                    [
                        [-526, 541, -444]
                    ],
                    [
                        [542]
                    ],
                    [
                        [543]
                    ],
                    [
                        [544]
                    ],
                    [
                        [545]
                    ],
                    [
                        [546]
                    ],
                    [
                        [547]
                    ],
                    [
                        [548]
                    ],
                    [
                        [-531, 177, 549, -176, 550, -196, 551, -194, -466, -192, -409, 552, 553, -52, -306, 554, -309, 555, 556, -93, -447, -276, 557, -284, -499, 558, 559]
                    ],
                    [
                        [560]
                    ],
                    [
                        [561]
                    ],
                    [
                        [562]
                    ]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 140041247,
                    "mapcolor7": 2,
                    "continent": "Europe",
                    "economy": "3. Emerging region: BRIC",
                    "mapcolor13": 7,
                    "iso_a3": "RUS",
                    "name": "Russia",
                    "mapcolor9": 7
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [563, -56, -211, 564]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 10473282,
                    "mapcolor7": 5,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 10,
                    "iso_a3": "RWA",
                    "name": "Rwanda",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-255, -479, 565, -449]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": -99,
                    "mapcolor7": 4,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 4,
                    "iso_a3": "ESH",
                    "name": "W. Sahara",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-428, 566, -535, 567, -22, -508, 568, 569, -397, -380]
                ],
                "properties": {
                    "income_grp": "2. High income: nonOECD",
                    "pop_est": 28686633,
                    "mapcolor7": 6,
                    "continent": "Asia",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 7,
                    "iso_a3": "SAU",
                    "name": "Saudi Arabia",
                    "mapcolor9": 6
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-268, -283, 570, -123, 571, -436, -264, 572, -270, 573]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 25946220,
                    "mapcolor7": 2,
                    "continent": "Africa",
                    "economy": "6. Developing region",
                    "mapcolor13": 1,
                    "iso_a3": "SDN",
                    "name": "Sudan",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-282, -415, 574, -209, -118, -571]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 10625176,
                    "mapcolor7": 1,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 5,
                    "iso_a3": "SSD",
                    "name": "S. Sudan",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-459, -317, -321, 575, -319, 576, -477]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 13711597,
                    "mapcolor7": 2,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 5,
                    "iso_a3": "SEN",
                    "name": "Senegal",
                    "mapcolor9": 5
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [577]
                    ],
                    [
                        [578]
                    ],
                    [
                        [579]
                    ],
                    [
                        [580]
                    ],
                    [
                        [581]
                    ]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 595613,
                    "mapcolor7": 1,
                    "continent": "Oceania",
                    "economy": "7. Least developed region",
                    "mapcolor13": 6,
                    "iso_a3": "SLB",
                    "name": "Solomon Is.",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-435, 582, -314]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 6440053,
                    "mapcolor7": 1,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 7,
                    "iso_a3": "SLE",
                    "name": "Sierra Leone",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [583, -330, -338]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 7185218,
                    "mapcolor7": 1,
                    "continent": "North America",
                    "economy": "6. Developing region",
                    "mapcolor13": 8,
                    "iso_a3": "SLV",
                    "name": "El Salvador",
                    "mapcolor9": 6
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [584, -279, -242, 585]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 3500000,
                    "mapcolor7": 3,
                    "continent": "Africa",
                    "economy": "6. Developing region",
                    "mapcolor13": 2,
                    "iso_a3": "-99",
                    "name": "Somaliland",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-410, -280, -585, 586]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 9832017,
                    "mapcolor7": 2,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 7,
                    "iso_a3": "SOM",
                    "name": "Somalia",
                    "mapcolor9": 6
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-81, -457, -426, -465, -86, -340, -348, -539]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 7379339,
                    "mapcolor7": 3,
                    "continent": "Europe",
                    "economy": "6. Developing region",
                    "mapcolor13": 10,
                    "iso_a3": "SRB",
                    "name": "Serbia",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-293, 587, -101, -333, 588]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 481267,
                    "mapcolor7": 1,
                    "continent": "South America",
                    "economy": "6. Developing region",
                    "mapcolor13": 6,
                    "iso_a3": "SUR",
                    "name": "Suriname",
                    "mapcolor9": 7
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [589, -350, -41, -233, -528]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 5463046,
                    "mapcolor7": 2,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 9,
                    "iso_a3": "SVK",
                    "name": "Slovakia",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-343, 590, -394, -43, -349]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 2005692,
                    "mapcolor7": 2,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 12,
                    "iso_a3": "SVN",
                    "name": "Slovenia",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [591, -500, -286]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 9059651,
                    "mapcolor7": 1,
                    "continent": "Europe",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 4,
                    "iso_a3": "SWE",
                    "name": "Sweden",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-468, 592]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 1123913,
                    "mapcolor7": 3,
                    "continent": "Africa",
                    "economy": "6. Developing region",
                    "mapcolor13": 5,
                    "iso_a3": "SWZ",
                    "name": "Swaziland",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-400, -385, -433, 593, 594, -382]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 20178485,
                    "mapcolor7": 2,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 6,
                    "iso_a3": "SYR",
                    "name": "Syria",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-572, -122, -208, -491, -437]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 10329208,
                    "mapcolor7": 6,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 6,
                    "iso_a3": "TCD",
                    "name": "Chad",
                    "mapcolor9": 8
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-66, 595, -310, -70]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 6019877,
                    "mapcolor7": 3,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 5,
                    "iso_a3": "TGO",
                    "name": "Togo",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-420, 596, -484, 597, -461, -429]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 65905410,
                    "mapcolor7": 3,
                    "continent": "Asia",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 1,
                    "iso_a3": "THA",
                    "name": "Thailand",
                    "mapcolor9": 8
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-416, -189, -6, 598]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 7349145,
                    "mapcolor7": 3,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 5,
                    "iso_a3": "TJK",
                    "name": "Tajikistan",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-4, -373, 599, -406, 600]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 4884887,
                    "mapcolor7": 3,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 9,
                    "iso_a3": "TKM",
                    "name": "Turkmenistan",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-352, 601]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 1131612,
                    "mapcolor7": 2,
                    "continent": "Asia",
                    "economy": "7. Least developed region",
                    "mapcolor13": 3,
                    "iso_a3": "TLS",
                    "name": "Timor-Leste",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [602]
                ],
                "properties": {
                    "income_grp": "2. High income: nonOECD",
                    "pop_est": 1310000,
                    "mapcolor7": 5,
                    "continent": "North America",
                    "economy": "6. Developing region",
                    "mapcolor13": 5,
                    "iso_a3": "TTO",
                    "name": "Trinidad and Tobago",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-439, -250, 603]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 10486339,
                    "mapcolor7": 4,
                    "continent": "Africa",
                    "economy": "6. Developing region",
                    "mapcolor13": 2,
                    "iso_a3": "TUN",
                    "name": "Tunisia",
                    "mapcolor9": 3
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [-307, -35, -377, -383, -595, 604]
                    ],
                    [
                        [-326, -78, 605]
                    ]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 76805524,
                    "mapcolor7": 6,
                    "continent": "Asia",
                    "economy": "4. Emerging region: MIKT",
                    "mapcolor13": 4,
                    "iso_a3": "TUR",
                    "name": "Turkey",
                    "mapcolor9": 8
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [606]
                ],
                "properties": {
                    "income_grp": "2. High income: nonOECD",
                    "pop_est": 22974347,
                    "mapcolor7": 1,
                    "continent": "Asia",
                    "economy": "2. Developed region: nonG7",
                    "mapcolor13": 2,
                    "iso_a3": "TWN",
                    "name": "Taiwan",
                    "mapcolor9": 7
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [607, -412, 608, 609, -474, 610, -481, 611, 612, -53, 613, -564, 614]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 41048532,
                    "mapcolor7": 3,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 2,
                    "iso_a3": "TZA",
                    "name": "Tanzania",
                    "mapcolor9": 2
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-414, 615, -615, -565, -210, -575]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 32369558,
                    "mapcolor7": 6,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 4,
                    "iso_a3": "UGA",
                    "name": "Uganda",
                    "mapcolor9": 6
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [616, -537, -452, -540, -346, -590, -527, -89, -557]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 45700395,
                    "mapcolor7": 5,
                    "continent": "Europe",
                    "economy": "6. Developing region",
                    "mapcolor13": 3,
                    "iso_a3": "UKR",
                    "name": "Ukraine",
                    "mapcolor9": 6
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [617, -29, -104]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 3494382,
                    "mapcolor7": 1,
                    "continent": "South America",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 10,
                    "iso_a3": "URY",
                    "name": "Uruguay",
                    "mapcolor9": 2
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [618]
                    ],
                    [
                        [619]
                    ],
                    [
                        [620]
                    ],
                    [
                        [621]
                    ],
                    [
                        [622]
                    ],
                    [
                        [623, 140, -141, -140, 624, -138, 625, -136, 626, -134, 627, -456, 628, -143]
                    ],
                    [
                        [629]
                    ],
                    [
                        [630]
                    ],
                    [
                        [631]
                    ],
                    [
                        [-147, 632, -145, 633]
                    ]
                ],
                "properties": {
                    "income_grp": "1. High income: OECD",
                    "pop_est": 313973000,
                    "mapcolor7": 4,
                    "continent": "North America",
                    "economy": "1. Developed region: G7",
                    "mapcolor13": 1,
                    "iso_a3": "USA",
                    "name": "United States",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-417, -599, -5, -601, -405]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 27606007,
                    "mapcolor7": 2,
                    "continent": "Asia",
                    "economy": "6. Developing region",
                    "mapcolor13": 4,
                    "iso_a3": "UZB",
                    "name": "Uzbekistan",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-334, -108, -218, 634]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 26814843,
                    "mapcolor7": 1,
                    "continent": "South America",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 4,
                    "iso_a3": "VEN",
                    "name": "Venezuela",
                    "mapcolor9": 1
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [635, -418, -431, -181]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 86967524,
                    "mapcolor7": 5,
                    "continent": "Asia",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 4,
                    "iso_a3": "VNM",
                    "name": "Vietnam",
                    "mapcolor9": 5
                }
            }, {
                "type": "MultiPolygon",
                "arcs": [
                    [
                        [636]
                    ],
                    [
                        [637]
                    ]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 218519,
                    "mapcolor7": 6,
                    "continent": "Oceania",
                    "economy": "7. Least developed region",
                    "mapcolor13": 3,
                    "iso_a3": "VUT",
                    "name": "Vanuatu",
                    "mapcolor9": 7
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [638, -569, -507]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 23822783,
                    "mapcolor7": 5,
                    "continent": "Asia",
                    "economy": "7. Least developed region",
                    "mapcolor13": 11,
                    "iso_a3": "YEM",
                    "name": "Yemen",
                    "mapcolor9": 3
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-469, -593, -467, 639, -488, -115, 640],
                    [-442]
                ],
                "properties": {
                    "income_grp": "3. Upper middle income",
                    "pop_est": 49052489,
                    "mapcolor7": 2,
                    "continent": "Africa",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 2,
                    "iso_a3": "ZAF",
                    "name": "South Africa",
                    "mapcolor9": 4
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-612, -480, -471, 641, -117, -487, -7, -213, 642]
                ],
                "properties": {
                    "income_grp": "4. Lower middle income",
                    "pop_est": 11862740,
                    "mapcolor7": 5,
                    "continent": "Africa",
                    "economy": "7. Least developed region",
                    "mapcolor13": 13,
                    "iso_a3": "ZMB",
                    "name": "Zambia",
                    "mapcolor9": 5
                }
            }, {
                "type": "Polygon",
                "arcs": [
                    [-641, -114, -642, -470]
                ],
                "properties": {
                    "income_grp": "5. Low income",
                    "pop_est": 12619600,
                    "mapcolor7": 1,
                    "continent": "Africa",
                    "economy": "5. Emerging region: G20",
                    "mapcolor13": 9,
                    "iso_a3": "ZWE",
                    "name": "Zimbabwe",
                    "mapcolor9": 3
                }
            }]
        }
    },
    "arcs": [
        [
            [708277, 668058],
            [495, -2061]
        ],
        [
            [708772, 665997],
            [-1617, -805],
            [-1413, -1326],
            [-3187, -835],
            [-2983, -1508],
            [-1622, -3128],
            [657, -3043],
            [318, -3572],
            [-1384, -3016],
            [116, -2759],
            [-764, -2586],
            [-2642, 225],
            [1092, -4751],
            [-1768, -1817],
            [-1180, -4334],
            [154, -4313],
            [-1087, -2019],
            [-1027, 669],
            [-2123, -937],
            [-303, -2009],
            [-2068, 13],
            [-1549, -4065],
            [-97, -6110],
            [-3610, -2986],
            [-1935, 631],
            [-562, -1574],
            [-1660, 915],
            [-2779, -1075],
            [-4655, 3667]
        ],
        [
            [669094, 613549],
            [2520, 6510],
            [-228, 4623],
            [-2103, 1210],
            [-218, 4559],
            [-910, 5733],
            [1188, 3932],
            [-1209, 1060],
            [763, 5225],
            [1132, 8947]
        ],
        [
            [670029, 655348],
            [2833, -2724],
            [2095, 958],
            [580, 3253],
            [2193, 1083],
            [1565, 2184],
            [555, 5743],
            [2341, 1389],
            [435, 2556],
            [1310, -1920],
            [837, -223]
        ],
        [
            [684773, 667647],
            [1548, -47],
            [2095, -1517]
        ],
        [
            [688416, 666083],
            [849, -875],
            [2011, 2307],
            [935, -1388],
            [896, 3288],
            [1661, -149],
            [427, 1055],
            [294, 2896],
            [1196, 2498],
            [1504, -1633],
            [-302, -2195],
            [840, -341],
            [-259, -6033],
            [1100, -2351],
            [968, 1509],
            [1232, 713],
            [1731, 3214],
            [1913, -529],
            [2865, -11]
        ],
        [
            [566422, 320881],
            [294, -2229],
            [-316, -3483],
            [488, -3368],
            [-414, -2689],
            [237, -2479],
            [-5784, 90],
            [-128, -22849],
            [1874, -5875],
            [1813, -4485]
        ],
        [
            [564486, 273514],
            [-5106, -2927],
            [-6724, 1017],
            [-1925, 3440],
            [-11260, -310],
            [-420, -504],
            [-1656, 3247],
            [-1801, 214],
            [-1663, -1223],
            [-1337, -1366]
        ],
        [
            [532594, 275102],
            [-261, 4515],
            [385, 6315],
            [958, 6574],
            [145, 3082],
            [901, 6473],
            [662, 2943],
            [1596, 4698],
            [891, 3195],
            [292, 5320],
            [-146, 4070],
            [-831, 2567],
            [-739, 4357],
            [-683, 4308],
            [150, 1493],
            [853, 2847],
            [-842, 6937],
            [-569, 4807],
            [-1392, 4543],
            [264, 1396]
        ],
        [
            [534228, 355542],
            [1147, 965],
            [805, -134],
            [974, 863],
            [8197, -95],
            [685, -5352],
            [797, -4306],
            [639, -2322],
            [1063, -3754],
            [1837, 580],
            [917, 1010],
            [1535, -1014],
            [416, 1796],
            [697, 4185],
            [1723, 280],
            [150, 1244],
            [1417, 27],
            [-242, -2587],
            [3370, 63],
            [51, -4518],
            [563, -2771],
            [-409, -4329],
            [204, -4416],
            [926, -2665],
            [-148, -8545],
            [687, 659],
            [1208, -177],
            [1720, 1076],
            [1265, -424]
        ],
        [
            [533839, 357769],
            [-742, 5400]
        ],
        [
            [533097, 363169],
            [1121, 3100],
            [839, 1208],
            [1041, -2463]
        ],
        [
            [536098, 365014],
            [-1011, -1510],
            [-454, -1846],
            [-87, -3130],
            [-707, -759]
        ],
        [
            [554827, 705889],
            [177, -1351],
            [747, 636]
        ],
        [
            [555751, 705174],
            [592, -1927],
            [665, -736],
            [187, -2602]
        ],
        [
            [557195, 699909],
            [-353, -2444],
            [394, -3080],
            [1152, -1748]
        ],
        [
            [558388, 692637],
            [-55, -1887],
            [-903, -1041],
            [-167, -2334],
            [-1291, -3483]
        ],
        [
            [555972, 683892],
            [-473, 503],
            [-55, 1580],
            [-1539, 2411],
            [-242, 3421],
            [235, 4900],
            [379, 2229],
            [-467, 1132]
        ],
        [
            [553810, 700068],
            [-187, 2285],
            [1204, 3536]
        ],
        [
            [656280, 584002],
            [377, -5672]
        ],
        [
            [656657, 578330],
            [-1418, -28],
            [-228, -4676],
            [492, -999],
            [-1257, -1414],
            [-8, -2935],
            [-810, -2972],
            [-72, -2892]
        ],
        [
            [653356, 562414],
            [-560, -1518],
            [-8350, 3621],
            [-1064, 7275],
            [-106, 1660]
        ],
        [
            [643276, 573452],
            [494, 349],
            [103, -1969],
            [2174, 1132],
            [2297, -188],
            [1678, -212],
            [1902, 4855],
            [2073, 4605],
            [1755, 4426]
        ],
        [
            [655752, 586450],
            [528, -2448]
        ],
        [
            [314000, 5135],
            [-1674, 192],
            [-2975, 4],
            [-1, 16036]
        ],
        [
            [309350, 21367],
            [1066, -3330],
            [1389, -5385],
            [3611, -4309],
            [3889, -1795],
            [-1250, -3591],
            [-2639, -359],
            [-1416, 2537]
        ],
        [
            [325875, 239577],
            [5106, -11717],
            [2272, -1092],
            [3394, -5304],
            [2860, -2807],
            [399, -3169],
            [-2735, -10916],
            [2802, -1954],
            [3119, -1096],
            [2197, 1153],
            [2520, 5501],
            [454, 6338]
        ],
        [
            [348263, 214514],
            [1375, 1376],
            [1394, -4145],
            [-57, -5735],
            [-2338, -3959],
            [-1866, -2924],
            [-3135, -6971],
            [-3706, -9792]
        ],
        [
            [339930, 182364],
            [-694, -5746],
            [-743, -7382],
            [27, -7153],
            [-603, -1598],
            [-215, -4641]
        ],
        [
            [337702, 155844],
            [-190, -3749],
            [3527, -6151],
            [-379, -4950],
            [1736, -3129],
            [-142, -3507],
            [-2669, -9208],
            [-4118, -3852],
            [-5571, -1495],
            [-3052, 723],
            [584, -4283],
            [-569, -5374],
            [513, -3622],
            [-1666, -2527],
            [-2847, -991],
            [-2671, 2615],
            [-1072, -1879],
            [388, -7135],
            [1875, -2162],
            [1521, 2264],
            [827, -3730],
            [-2557, -2229],
            [-2231, -4465],
            [-408, -7224],
            [-657, -3845],
            [-2624, -20],
            [-2178, -3679],
            [-796, -5385],
            [2732, -5257],
            [2655, -1452],
            [-955, -6443],
            [-3281, -4050],
            [-1805, -8419],
            [-2535, -2833],
            [-1139, -3363],
            [897, -7458],
            [1849, -4157],
            [-1171, 363]
        ],
        [
            [309523, 23786],
            [-2574, 1125],
            [-6713, 961],
            [-1151, 4187],
            [54, 5378],
            [-1850, -463],
            [-978, 2604],
            [-243, 7615],
            [2131, 3158],
            [881, 4555],
            [-323, 3632],
            [1473, 6130],
            [1014, 9509],
            [-298, 4215],
            [1213, 1360],
            [-298, 2706],
            [-1288, 1438],
            [915, 3013],
            [-1253, 2722],
            [-649, 8285],
            [1117, 1461],
            [-469, 8754],
            [652, 7355],
            [743, 6406],
            [1663, 2607],
            [-844, 7010],
            [-9, 6597],
            [2103, 4689],
            [-65, 5999],
            [1586, 7010],
            [7, 6604],
            [-721, 1312],
            [-1280, 12396],
            [1711, 7386],
            [-262, 6955],
            [992, 6525],
            [1820, 6736],
            [1960, 4465],
            [-831, 2818],
            [580, 2312],
            [-88, 11967],
            [3025, 3542],
            [954, 7460],
            [-338, 1799]
        ],
        [
            [313592, 236081],
            [2315, 6488],
            [3635, -1748],
            [1633, -5187],
            [1083, 5777],
            [3168, -297],
            [449, -1537]
        ],
        [
            [629182, 677757],
            [-1006, -211]
        ],
        [
            [628176, 677546],
            [-1134, 4154],
            [13, 1108],
            [-1227, -16],
            [-823, 1926],
            [-578, -194]
        ],
        [
            [624427, 684524],
            [-1094, 2097],
            [-2066, 1785],
            [268, 3494],
            [-472, 2528]
        ],
        [
            [621063, 694428],
            [3860, 1120]
        ],
        [
            [624923, 695548],
            [575, -1887],
            [1058, -1243],
            [-559, -1801],
            [1480, -2463],
            [-783, -2287],
            [1179, -1953],
            [1247, -1177],
            [62, -4980]
        ],
        [
            [695222, 42381],
            [-4264, -467],
            [-70, 3824],
            [410, 2962],
            [187, 1472],
            [1792, -2262],
            [2625, -897],
            [97, -1365],
            [-777, -3267]
        ],
        [
            [903882, 106417],
            [2684, -2479],
            [1512, 985],
            [2169, 1381],
            [1666, -483],
            [197, -8523],
            [-952, -2475],
            [-287, -5777],
            [-970, 1967],
            [-1929, -5005],
            [-575, 386],
            [-1708, 223],
            [-1712, 6147],
            [-380, 4741],
            [-1603, 6255],
            [71, 3293],
            [1817, -636]
        ],
        [
            [898782, 300510],
            [1001, -5634],
            [1782, 2708],
            [920, -3040],
            [1333, -2804],
            [-286, -3183],
            [593, -6157],
            [421, -3585],
            [700, -877],
            [754, -6137],
            [-268, -3723],
            [899, -4870],
            [3010, -3752],
            [1963, -3412],
            [1863, -3126],
            [-364, -1740],
            [1589, -4502],
            [1080, -7770],
            [1109, 1578],
            [1126, -3112],
            [679, 1104],
            [479, -7611],
            [1971, -4409],
            [1290, -2741],
            [2171, -5814],
            [780, -5771],
            [72, -4094],
            [-192, -4445],
            [1324, -6102],
            [-159, -6355],
            [-481, -3326],
            [-750, -6405],
            [57, -4118],
            [-550, -5147],
            [-1227, -6532],
            [-2058, -3528],
            [-1014, -5563],
            [-926, -3550],
            [-824, -6198],
            [-1072, -3579],
            [-702, -5374],
            [-359, -4946],
            [142, -2271],
            [-1593, -2495],
            [-3109, -261],
            [-2563, -2945],
            [-1277, -2782],
            [-1678, -3082],
            [-2301, 3174],
            [-1702, 1266],
            [431, 3743],
            [-1518, -1358],
            [-2432, -5200],
            [-2402, 1948],
            [-1575, 1136],
            [-1588, 513],
            [-2689, 2077],
            [-1796, 4426],
            [-515, 5453],
            [-646, 3628],
            [-1365, 2913],
            [-2672, 865],
            [913, 3483],
            [-672, 5332],
            [-1357, -4970],
            [-2471, -1319],
            [1452, 3972],
            [421, 4144],
            [1073, 3517],
            [-221, 5318],
            [-2260, -6124],
            [-1736, -2456],
            [-1064, -5711],
            [-2169, 2954],
            [87, 3811],
            [-1739, 5208],
            [-1465, 2691],
            [522, 1657],
            [-3564, 4352],
            [-1952, 205],
            [-2672, 3496],
            [-4973, -679],
            [-3597, -2571],
            [-3161, -2397],
            [-2651, 476],
            [-2944, -3682],
            [-2409, -1657],
            [-535, -3766],
            [-1026, -2918],
            [-2357, -174],
            [-1744, -639],
            [-2456, 1310],
            [-1997, -784],
            [-1907, -329],
            [-1652, -3830],
            [-810, 325],
            [-1393, -2030],
            [-1336, -2283],
            [-2026, 282],
            [-1862, 3],
            [-2947, 4586],
            [-1493, 1364],
            [61, 4115],
            [1379, 978],
            [471, 1635],
            [-98, 2579],
            [339, 4993],
            [-311, 4256],
            [-1468, 7259],
            [-456, 4099],
            [120, 4090],
            [-1106, 4674],
            [-71, 2110],
            [-1230, 2861],
            [-346, 5625],
            [-1588, 5684],
            [-384, 3064],
            [1220, -3106],
            [-937, 6662],
            [1378, -2082],
            [822, -2781],
            [-47, 3678],
            [-1374, 5654],
            [-267, 2262],
            [-644, 2148],
            [302, 4154],
            [569, 1767],
            [379, 3593],
            [-297, 4197],
            [1148, 5167],
            [210, -5469],
            [1173, 4940],
            [2257, 2401],
            [1353, 3063],
            [2123, 2635],
            [1263, 561],
            [765, -885],
            [2189, 2676],
            [1684, 796],
            [422, 1574],
            [735, 655],
            [1535, -169],
            [2920, 2102],
            [1510, 3188],
            [709, 3838],
            [1629, 3646],
            [125, 2865],
            [73, 3904],
            [1944, 6102],
            [1170, -6199],
            [1182, 1432],
            [-989, 3394],
            [871, 3484],
            [1226, -1556],
            [337, 5464],
            [1518, 3533],
            [670, 2834],
            [1397, 1223],
            [43, 2007],
            [1221, -838],
            [49, 1805],
            [1221, 1028],
            [1343, 968],
            [2052, -3295],
            [1542, -4253],
            [1738, -49],
            [1767, -674],
            [-589, 3943],
            [1331, 5759],
            [1252, 1877],
            [-433, 1794],
            [1206, 4101],
            [1683, 2533],
            [1421, -853],
            [2334, 1353],
            [-50, 3670],
            [-2035, 2364],
            [1479, 1043],
            [1840, -1780],
            [1476, -2945],
            [2339, -1837],
            [793, 726],
            [1722, -2207],
            [1623, 2056],
            [1044, -625],
            [650, 1379],
            [1275, -3552],
            [-740, -3844],
            [-1055, -2901],
            [-954, -239],
            [322, -2871],
            [-817, -3588],
            [-986, -3530],
            [199, -2027],
            [2208, -3967],
            [2139, -2302],
            [1431, -2472],
            [2008, -4255],
            [783, 7],
            [1454, -1839],
            [422, -2218],
            [2652, -2436],
            [1834, 2454],
            [543, 3856],
            [564, 3183],
            [345, 3937],
            [844, 5713],
            [-385, 3473],
            [200, 2089],
            [-321, 4110],
            [364, 5410],
            [533, 1459],
            [-433, 2398],
            [671, 3807],
            [528, 3945],
            [70, 2049],
            [1032, 2690],
            [783, -3513],
            [193, -4505],
            [692, -868],
            [119, -3017],
            [1010, -3653],
            [208, -4064],
            [-98, -2609]
        ],
        [
            [547111, 748320],
            [-223, -912],
            [277, -2489]
        ],
        [
            [547165, 744919],
            [-211, -2934],
            [-1564, -14],
            [538, -1556],
            [-922, -4623]
        ],
        [
            [545006, 735792],
            [-530, -1212],
            [-2429, -179],
            [-1402, -1629],
            [-2294, 556]
        ],
        [
            [538351, 733328],
            [-3972, 1855],
            [-621, 2497],
            [-2745, -1248],
            [-323, -1366],
            [-1683, 1021]
        ],
        [
            [529007, 736087],
            [-1417, 195],
            [-1257, 1308],
            [425, 1758],
            [-108, 1274]
        ],
        [
            [526650, 740622],
            [839, 396],
            [1405, -1994],
            [396, 1895],
            [2450, -306],
            [1985, 1288],
            [1332, -221],
            [866, -1470],
            [259, 1220],
            [-393, 4679],
            [998, 912],
            [979, 3311]
        ],
        [
            [537766, 750332],
            [2064, -2312],
            [1562, 2938],
            [978, 536],
            [2156, -2191],
            [1305, 373],
            [1280, -1356]
        ],
        [
            [628176, 677546],
            [-1905, 954],
            [-1403, 3315],
            [-441, 2709]
        ],
        [
            [634956, 699574],
            [1461, -3781],
            [1413, -5094],
            [1294, -336],
            [855, -1936],
            [-2287, -577],
            [-484, -5577],
            [-477, -2516],
            [-1019, -1678],
            [74, -3556]
        ],
        [
            [635786, 674523],
            [-691, -358],
            [-1732, 3760],
            [957, 3553],
            [-820, 2107],
            [-1042, -530],
            [-3276, -5298]
        ],
        [
            [624923, 695548],
            [680, 1173],
            [2070, -2066],
            [1498, -426],
            [378, 842],
            [-1368, 3885],
            [721, 990]
        ],
        [
            [628902, 699946],
            [781, -240],
            [1909, -4362],
            [1229, -491],
            [476, 1827],
            [1659, 2894]
        ],
        [
            [585397, 377557],
            [25, -2334],
            [-685, -1502],
            [-1081, -3746],
            [-1008, -2601],
            [-294, -87]
        ],
        [
            [582354, 367287],
            [14, 319],
            [-1020, 6843]
        ],
        [
            [581348, 374449],
            [-25, 1244],
            [-699, 3265]
        ],
        [
            [580624, 378958],
            [1687, -565],
            [851, 4089],
            [1475, -469]
        ],
        [
            [584637, 382013],
            [162, -2828],
            [598, -1628]
        ],
        [
            [517101, 764166],
            [-315, -4852]
        ],
        [
            [516786, 759314],
            [-724, -271],
            [-301, -4027]
        ],
        [
            [515761, 755016],
            [-2430, 3274],
            [-1426, -560],
            [-1938, 3386],
            [-1292, 2882],
            [-1291, 119],
            [-402, 2525]
        ],
        [
            [506982, 766642],
            [2226, 1417]
        ],
        [
            [509208, 768059],
            [2033, -564]
        ],
        [
            [511241, 767495],
            [2575, 1492],
            [1758, -3144],
            [1527, -1677]
        ],
        [
            [510031, 483078],
            [-109, -2386],
            [625, -4260],
            [-547, -2890],
            [292, -1932],
            [-1347, -4445],
            [-856, -2202],
            [-523, -4529],
            [70, -4568],
            [-160, -11575]
        ],
        [
            [507476, 444291],
            [-2295, -838]
        ],
        [
            [505181, 443453],
            [-684, 4954],
            [126, 16492],
            [-559, 1479],
            [-106, 3524],
            [-965, 2515],
            [-848, 2120],
            [353, 3781]
        ],
        [
            [502498, 478318],
            [956, 813],
            [565, 3139],
            [1358, 671],
            [607, 2147]
        ],
        [
            [505984, 485088],
            [933, 2104],
            [995, 18],
            [2119, -4132]
        ],
        [
            [501041, 506550],
            [-220, -3480],
            [373, -3271],
            [1564, -4689],
            [86, -3475],
            [3203, -1629],
            [-63, -4918]
        ],
        [
            [502498, 478318],
            [-2432, 153]
        ],
        [
            [500066, 478471],
            [-1285, 572],
            [-897, -1159],
            [-1227, 524],
            [-4825, -339],
            [-66, -4074],
            [379, -5406]
        ],
        [
            [492145, 468589],
            [-1901, 1851],
            [-1301, -272],
            [-972, -1806],
            [-1249, 1516],
            [-485, 2375],
            [-1250, 1565]
        ],
        [
            [484987, 473818],
            [-183, 4169],
            [757, 3044],
            [-64, 2432],
            [2205, 5952],
            [407, 4924],
            [762, 1753],
            [1343, -968],
            [1164, 1462],
            [378, 1844],
            [2155, 3219],
            [530, 2245],
            [2596, 2979],
            [1530, 1022],
            [693, -1378],
            [1781, 33]
        ],
        [
            [757423, 557624],
            [-56, -5150],
            [-970, 1087],
            [182, -5778]
        ],
        [
            [756579, 547783],
            [-794, 3744],
            [-160, 3658],
            [-529, 3456],
            [-1160, 4180],
            [-2559, 287],
            [253, -2960],
            [-872, -3995],
            [-1182, 1456],
            [-404, -1307],
            [-787, 783],
            [-1075, 643]
        ],
        [
            [747310, 557728],
            [-432, 5913],
            [-963, 5400],
            [473, 4327],
            [-1710, 1924],
            [617, 2617],
            [1736, 2676],
            [-2005, 3801],
            [982, 4872],
            [2200, -3103],
            [1326, -354],
            [245, -4993],
            [2643, -985],
            [2576, 106],
            [1602, -1226],
            [-1281, -6077],
            [-1243, -415],
            [-857, -4087],
            [1520, -3721],
            [454, 4589],
            [767, 23],
            [1463, -11391]
        ],
        [
            [579327, 713208],
            [-1441, -2975],
            [-1015, -5136],
            [897, -4097]
        ],
        [
            [577768, 701000],
            [-2392, 963],
            [-2829, -2259]
        ],
        [
            [572547, 699704],
            [-31, -3576],
            [-2524, -678],
            [-1957, 2509],
            [-2224, -1974],
            [-2055, 208]
        ],
        [
            [563756, 696193],
            [-197, 4749],
            [-1391, 2305]
        ],
        [
            [562168, 703247],
            [456, 1013],
            [-301, 854],
            [468, 2285],
            [1058, 2245],
            [-1349, 3100],
            [-249, 2623],
            [685, 1629]
        ],
        [
            [562936, 716996],
            [799, -2953],
            [1076, 526],
            [2135, -1120],
            [4079, -377],
            [1378, 1831],
            [3270, 1670],
            [2021, -2611],
            [1633, -754]
        ],
        [
            [284626, 569964],
            [-682, -357],
            [-706, 4137],
            [-1040, 2079],
            [605, 4558],
            [836, -290],
            [972, -5960],
            [15, -4167]
        ],
        [
            [283833, 590216],
            [-3028, -1149],
            [-194, 2657],
            [1305, 575],
            [1834, -216],
            [83, -1867]
        ],
        [
            [286111, 590288],
            [-479, -5104],
            [-511, 920],
            [45, 3753],
            [-1244, 2838],
            [-6, 825],
            [2195, -3232]
        ],
        [
            [552792, 721486],
            [1008, 20],
            [-696, -3159],
            [1339, -2762],
            [-405, -3378],
            [-654, -317]
        ],
        [
            [553384, 711890],
            [-519, -656],
            [-903, -1669],
            [-407, -3950]
        ],
        [
            [551555, 705615],
            [-2459, 2718],
            [-1048, 3000],
            [-1059, 1590],
            [-1277, 2682],
            [-602, 2225],
            [-1360, 3358],
            [581, 2981],
            [997, -1650],
            [602, 1490],
            [1298, 160],
            [2388, -1193],
            [1920, 100],
            [1256, -1590]
        ],
        [
            [588294, 773487],
            [-2385, -426],
            [-856, -1577],
            [-178, -3614],
            [-1105, 694],
            [-2507, -344],
            [-728, 1679],
            [-1042, -1252],
            [-1045, 1038],
            [-2187, 144],
            [-3101, 1723],
            [-2806, 563],
            [-2151, -159],
            [-1523, -1947],
            [-1328, -280]
        ],
        [
            [565352, 769729],
            [-53, 3197],
            [-857, 3327],
            [1666, 1466],
            [16, 2863],
            [-770, 2731],
            [-121, 3177]
        ],
        [
            [565233, 786490],
            [2685, -49],
            [3016, 2706],
            [644, 4053],
            [2278, 2300],
            [-261, 3216]
        ],
        [
            [573595, 798716],
            [1689, 1208],
            [2984, 2771]
        ],
        [
            [578268, 802695],
            [2925, -1801],
            [394, -1783],
            [1458, 858],
            [2715, -1713],
            [272, -3371],
            [-595, -1937],
            [1742, -4702],
            [1130, -1310],
            [-167, -1297],
            [1873, -1263],
            [800, -1915],
            [-1081, -1570],
            [-2241, 249],
            [-535, -671],
            [653, -2384],
            [683, -4598]
        ],
        [
            [252970, 513432],
            [-829, -2],
            [218, 8105],
            [21, 5692]
        ],
        [
            [252380, 527227],
            [-22, 1057],
            [337, 331],
            [504, -850],
            [995, 4335],
            [528, 94]
        ],
        [
            [254722, 532194],
            [10, -1053],
            [527, -33],
            [-47, -1954],
            [-449, -3106],
            [243, -1110],
            [-291, -2569],
            [175, -687],
            [-322, -3629],
            [-546, -1905],
            [-501, -228],
            [-551, -2488]
        ],
        [
            [338426, 254458],
            [-47, 2214],
            [-2588, 3673],
            [-2579, 102],
            [-4841, -2090],
            [-1332, -6319],
            [-70, -3863],
            [-1094, -8598]
        ],
        [
            [313592, 236081],
            [-2004, -984],
            [-1088, 9899],
            [-1492, 8055],
            [874, 6948],
            [-1457, 3041],
            [-370, 5181],
            [-1362, 4884]
        ],
        [
            [306693, 273105],
            [1752, 7751],
            [-1195, 6036],
            [638, 2414],
            [-498, 2662],
            [1085, 3587],
            [55, 6111],
            [136, 5048],
            [597, 2430],
            [-2401, 11558]
        ],
        [
            [306862, 320702],
            [2065, -607],
            [1430, 157],
            [620, 2172],
            [2429, 2910],
            [1463, 2696],
            [3635, 1216],
            [-296, -5382],
            [342, -2760],
            [-223, -4814],
            [3016, -6433],
            [3111, -1185],
            [1093, -2683],
            [1877, -1422],
            [1150, -2086],
            [1748, 71],
            [1613, -2130],
            [122, -4151],
            [542, -2097],
            [36, -3096],
            [-810, -120],
            [1068, -8362],
            [5325, -296],
            [-407, -4147],
            [298, -2834],
            [1517, -2016],
            [656, -4465],
            [-493, -5656],
            [-762, -3146],
            [268, -4093],
            [-869, -1485]
        ],
        [
            [342946, 412987],
            [1510, -588],
            [250, 1467],
            [-466, 1428],
            [278, 2079],
            [1121, -638],
            [1312, 734],
            [1591, -1521]
        ],
        [
            [348542, 415948],
            [1213, -1482],
            [860, 1947],
            [621, -300],
            [379, -2021],
            [1330, 513],
            [1065, 2728],
            [853, 5288],
            [1643, 6571]
        ],
        [
            [356506, 429192],
            [946, 340],
            [687, -3972],
            [1558, -12558],
            [1486, -1186],
            [75, -4957],
            [-2090, -5911],
            [864, -2165],
            [4911, -1128],
            [100, -7197],
            [2110, 4712],
            [3495, -2581],
            [4614, -4386],
            [1355, -4208],
            [-455, -3975],
            [3230, 2213],
            [5406, -3798],
            [4150, 280],
            [4106, -5943],
            [3548, -8045],
            [2139, -2071],
            [2376, -288],
            [1007, -2265],
            [942, -9143],
            [461, -4345],
            [-1106, -11871],
            [-1413, -4689],
            [-3915, -9992],
            [-1770, -8117],
            [-2056, -6226],
            [-695, -140],
            [-776, -5283],
            [197, -13455],
            [-774, -11068],
            [-295, -4735],
            [-879, -2833],
            [-492, -9600],
            [-2817, -9374],
            [-472, -7417],
            [-2248, -3112],
            [-651, -4304],
            [-3017, 17],
            [-4370, -2759],
            [-1957, -3195],
            [-3111, -2098],
            [-3269, -5717],
            [-2351, -7122],
            [-404, -5362],
            [462, -3966],
            [-519, -7254],
            [-631, -3504],
            [-1941, -3952],
            [-3082, -12639],
            [-2443, -5696],
            [-1888, -3358],
            [-1267, -6831],
            [-1838, -4106]
        ],
        [
            [351739, 156857],
            [-769, 4067],
            [1225, 3406],
            [-1606, 4886],
            [-2179, 3970],
            [-2859, 4600],
            [-1033, -210],
            [-2785, 5554],
            [-1803, -766]
        ],
        [
            [348263, 214514],
            [545, 4144],
            [376, 4246],
            [2, 3948],
            [-1000, 1303],
            [-1042, -1161],
            [-1035, 319],
            [-325, 2764],
            [-258, 6580],
            [-521, 2145],
            [-1876, 1944],
            [-1134, -1407],
            [-2932, 1379],
            [185, 9748],
            [-822, 3992]
        ],
        [
            [306862, 320702],
            [-1567, -1236],
            [-1264, 824],
            [186, 10908],
            [-2280, -4232],
            [-2451, 186],
            [-1050, 3830],
            [-1844, 417],
            [587, 3083],
            [-1543, 4369],
            [-1156, 6467],
            [732, 1313],
            [-3, 3033],
            [1680, 2073],
            [-277, 3883],
            [709, 2499],
            [201, 3351],
            [3177, 4887],
            [2276, 1382],
            [373, 1079],
            [2503, -337]
        ],
        [
            [305851, 368481],
            [1248, 19690],
            [66, 3114],
            [-435, 4112],
            [-1232, 2620],
            [14, 5217],
            [1564, 1183],
            [556, -743],
            [94, 2751],
            [-1628, 742],
            [-34, 4493],
            [5412, -160],
            [919, 2475],
            [771, -2277],
            [542, -4236],
            [524, 885]
        ],
        [
            [314232, 408347],
            [1529, -3798],
            [2160, 465],
            [538, 2198],
            [2066, 1676],
            [1143, 1179],
            [323, 3041],
            [1984, 2043],
            [-150, 1509],
            [-2353, 617],
            [-386, 4523],
            [112, 4814],
            [-1243, 1862],
            [521, 661],
            [2056, -919],
            [2209, -1795],
            [802, 1697],
            [1997, 1115],
            [3107, 2688],
            [1016, 2740],
            [-368, 2026]
        ],
        [
            [331295, 436689],
            [1444, 318],
            [647, -1655],
            [-361, -3153],
            [954, -1088],
            [637, -3337],
            [-770, -2529],
            [-442, -6113],
            [711, -3631],
            [201, -3323],
            [1709, -3369],
            [1364, -356],
            [307, 1406],
            [877, 311],
            [1257, 1259],
            [903, 1910],
            [1537, -609],
            [676, 257]
        ],
        [
            [817233, 431847],
            [1099, 2686],
            [2364, 3933]
        ],
        [
            [820696, 438466],
            [-125, -3536],
            [-162, -4586],
            [-1328, 228],
            [-583, -2447],
            [-1265, 3722]
        ],
        [
            [754712, 598774],
            [1131, -2291],
            [-195, -4412],
            [-2267, -213],
            [-2345, 482],
            [-1746, -1123],
            [-2525, 2726],
            [-60, 1439]
        ],
        [
            [746705, 595382],
            [1838, 5338],
            [1500, 1822],
            [1985, -1662],
            [1468, -175],
            [1216, -1931]
        ],
        [
            [570178, 271981],
            [1069, -5741],
            [559, -1281],
            [873, -4155],
            [3144, -7888],
            [1190, -773],
            [7, -2533],
            [817, -4554],
            [2148, -1102],
            [1770, -3244]
        ],
        [
            [581755, 240710],
            [-3930, -5289],
            [-2494, -5361],
            [-925, -4785],
            [-835, -2697],
            [-1511, -575],
            [-489, -3436],
            [-281, -2240],
            [-1776, -1673],
            [-2261, 356],
            [-1327, 2011],
            [-1171, 872],
            [-1355, -1664],
            [-680, -3440],
            [-1315, -2160],
            [-1389, -3205],
            [-1990, -732],
            [-620, 2521],
            [256, 4375],
            [-1647, 6824],
            [-750, 1078]
        ],
        [
            [555265, 221490],
            [0, 20958],
            [2738, 251],
            [82, 25579],
            [2067, 237],
            [4283, 2515],
            [1062, -2961],
            [1773, 2815],
            [843, 16],
            [1565, 1618]
        ],
        [
            [569678, 272518],
            [500, -537]
        ],
        [
            [566352, 461244],
            [1890, -2804],
            [1521, -2902],
            [26, -2334],
            [1868, -3739],
            [1157, -3108],
            [702, -4307],
            [2076, -2842],
            [447, -2277]
        ],
        [
            [576039, 436931],
            [-917, -762],
            [-1782, 166],
            [-2089, 755],
            [-1033, -615],
            [-416, -1746],
            [-900, -216],
            [-1096, 1519],
            [-3092, -3584],
            [-1266, 722],
            [-382, -554],
            [-830, -4336],
            [-2072, 1401],
            [-2032, 707],
            [-1770, 2649],
            [-2285, 2441],
            [-1488, -2313],
            [-1081, -3646],
            [-250, -5008]
        ],
        [
            [551258, 424511],
            [-1787, 401],
            [-1880, 1207],
            [-1655, -3806],
            [-1456, -6683]
        ],
        [
            [544480, 415630],
            [-293, 2081],
            [-124, 3276],
            [-1271, 2310],
            [-1025, 3706],
            [-237, 2578],
            [-1313, 3750],
            [224, 2140],
            [-277, 3024],
            [215, 5567],
            [666, 1304],
            [1397, 7277]
        ],
        [
            [542442, 452643],
            [2297, 540],
            [512, 1847],
            [460, -140],
            [694, -1627],
            [3497, 2748],
            [1180, 2803],
            [1448, 2511],
            [-275, 2527],
            [783, 661],
            [2683, -447],
            [2614, 3327],
            [2008, 7835],
            [1410, 2907],
            [1758, 1225]
        ],
        [
            [563511, 479360],
            [315, -3073],
            [1602, -4490],
            [8, -2930],
            [-451, -2988],
            [178, -2232],
            [964, -2068],
            [225, -335]
        ],
        [
            [323154, 733620],
            [2014, -963],
            [2576, 196],
            [-1366, -2942],
            [-1029, -469],
            [-3524, 3048],
            [-694, 2405],
            [1050, 2215],
            [973, -3490]
        ],
        [
            [328315, 751968],
            [-1352, -128],
            [-3600, 2251],
            [-2583, 3392],
            [961, 604],
            [3652, -1801],
            [2841, -3000],
            [81, -1318]
        ],
        [
            [156917, 747695],
            [-1397, -999],
            [-4562, 3261],
            [-833, 2549],
            [-2486, 2514],
            [-500, 2046],
            [-2860, 1292],
            [-1070, 3908],
            [240, 1663],
            [2916, -1566],
            [1704, -1090],
            [2611, -760],
            [945, -2477],
            [1373, -3409],
            [2773, -2965],
            [1146, -3967]
        ],
        [
            [344072, 763328],
            [-1839, -6281],
            [1814, 2426],
            [1865, -1539],
            [-975, -2504],
            [2465, -1969],
            [1282, 1750],
            [2770, -2208],
            [-860, -5259],
            [1944, 1228],
            [354, -3811],
            [863, -4464],
            [-1170, -6319],
            [-1256, -267],
            [-1826, 1355],
            [603, 5875],
            [-774, 913],
            [-3223, -6228],
            [-1658, 249],
            [1962, 3374],
            [-2666, 1745],
            [-2984, -429],
            [-5391, 219],
            [-426, 2127],
            [1730, 2528],
            [-1209, 1951],
            [2333, 4325],
            [2870, 11437],
            [1722, 4088],
            [2410, 2475],
            [1289, -315],
            [-536, -1948],
            [-1483, -4524]
        ],
        [
            [130055, 788339],
            [1306, -933],
            [2667, 574],
            [-832, -8153],
            [2418, -5775],
            [-1108, 14],
            [-1674, 3284],
            [-1027, 3306],
            [-1401, 2236],
            [-514, 3157],
            [165, 2290]
        ],
        [
            [279817, 845706],
            [-1088, -3775],
            [-1228, 611],
            [-729, 2143],
            [129, 496],
            [1073, 2154],
            [1137, -157],
            [706, -1472]
        ],
        [
            [272505, 849670],
            [-3251, -3961],
            [-1962, 166],
            [-608, 1943],
            [2064, 3312],
            [3816, -68],
            [-59, -1392]
        ],
        [
            [263441, 870829],
            [515, -3158],
            [1421, 1108],
            [1615, -1883],
            [3042, -2462],
            [3182, -2238],
            [246, -3414],
            [2045, 559],
            [1983, -2381],
            [-2465, -2260],
            [-4323, 1727],
            [-1560, 3233],
            [-2755, -3822],
            [-3952, -3715],
            [-954, 4200],
            [-3765, -689],
            [2415, 3551],
            [355, 5652],
            [947, 6577],
            [2008, -585]
        ],
        [
            [289261, 881540],
            [-3114, -360],
            [-693, 3514],
            [1180, 4025],
            [2546, 995],
            [2168, -1988],
            [31, -3076],
            [-313, -989],
            [-1805, -2121]
        ],
        [
            [234312, 895606],
            [-1728, -2518],
            [-3744, 2176],
            [-2262, -785],
            [-3793, 3226],
            [2444, 2227],
            [1942, 3113],
            [2947, -2036],
            [1667, -1293],
            [833, -1364],
            [1694, -2746]
        ],
        [
            [313507, 723477],
            [-1817, 4060],
            [3, 9791],
            [-1233, 2072],
            [-1863, -1220],
            [-923, 1887],
            [-2119, -5419],
            [-847, -5588],
            [-986, -3267],
            [-1180, -1111],
            [-890, -361],
            [-277, -1772],
            [-5119, -6],
            [-4220, -50],
            [-1254, -1321],
            [-2842, -5008]
        ],
        [
            [287940, 716164],
            [-32, 112],
            [-590, 527],
            [-881, -995],
            [-775, -1575],
            [-1233, 1358],
            [-2347, -977],
            [-1961, -1047],
            [-847, -849],
            [-831, -2456],
            [1108, -681],
            [848, 372],
            [132, 82]
        ],
        [
            [280531, 710035],
            [246, -2158],
            [0, -1]
        ],
        [
            [280777, 707876],
            [0, 1],
            [-2420, -883],
            [-1355, -908],
            [-739, -1117],
            [-1527, 723],
            [-826, -328],
            [-1214, -2008],
            [-2061, -2287],
            [-1524, 452]
        ],
        [
            [269111, 701521],
            [611, 2514],
            [1306, 3949]
        ],
        [
            [271028, 707984],
            [1797, 2376],
            [230, 2005],
            [-146, 3408],
            [1325, 3989],
            [-352, 4523],
            [1402, -4440],
            [2257, -989],
            [895, 2374],
            [-1799, 5498],
            [-906, 2252],
            [-2485, 1391],
            [-2252, 733],
            [-2112, 76],
            [-2084, 891],
            [-545, 1591],
            [-522, -1056]
        ],
        [
            [265731, 732606],
            [-745, 221]
        ],
        [
            [264986, 732827],
            [2, 10]
        ],
        [
            [264988, 732837],
            [580, 2412],
            [-1166, 901],
            [473, 2728],
            [-1099, 2108],
            [490, 2042],
            [-3118, 1079],
            [-929, 4071],
            [-664, 961],
            [-1914, 172],
            [-2583, 1448],
            [-626, -936],
            [-617, -1751],
            [-1577, -1128],
            [-1127, -2840]
        ],
        [
            [251111, 744104],
            [-3417, 1868],
            [-2250, -934],
            [-2694, 2226],
            [-2836, 1144],
            [-1940, 441],
            [-863, 1216],
            [-493, 3942],
            [-941, -34],
            [-8, -2759],
            [-5749, 5],
            [-9504, -5],
            [-9439, -1],
            [-8338, 1],
            [-8334, 0],
            [-8194, 0],
            [-8467, 0],
            [-2731, 0],
            [-8246, 0],
            [-7889, 0]
        ],
        [
            [158778, 751214],
            [-373, 18],
            [-5378, 7052],
            [-1984, 3102],
            [-5031, 2973],
            [-1548, 6357],
            [396, 4407],
            [-3554, 3058],
            [-487, 5789],
            [-3361, 5213],
            [-58, 3700]
        ],
        [
            [137400, 792883],
            [1544, 3463],
            [-77, 4530],
            [-4722, 4569],
            [-2841, 8192]
        ],
        [
            [131304, 813637],
            [-1736, 5151],
            [-2543, 3238]
        ],
        [
            [127025, 822026],
            [-1872, 2940],
            [-1475, 3714],
            [-2788, -2326],
            [-2703, -4013],
            [-2467, 4719],
            [-1940, 3144],
            [-2705, 1988],
            [-2736, 212],
            [15, 40886],
            [18, 26656]
        ],
        [
            [108372, 899946],
            [5182, -1731],
            [4373, -3454],
            [2896, -660],
            [2439, 2995],
            [3364, 2242],
            [4126, -876],
            [4161, 3153],
            [4546, 1790],
            [1908, -2976],
            [2073, 1677],
            [620, 3382],
            [1920, -765],
            [4697, -6439],
            [3698, 4867],
            [376, -5448],
            [3413, 1178],
            [1048, 2095],
            [3365, -414],
            [4248, -3016],
            [6501, -2632],
            [3823, -1219],
            [2721, 462],
            [3747, -3641],
            [-3909, -3563],
            [5022, -1540],
            [7498, 847],
            [2366, 1256],
            [2961, -4306],
            [3021, 3633],
            [-2835, 3047],
            [1794, 2458],
            [3381, 331],
            [2223, 718],
            [2242, -1715],
            [2791, -3901],
            [3102, 573],
            [4908, -3238],
            [4312, 1140],
            [4052, -172],
            [-320, 4469],
            [2470, 1254],
            [4304, -2436],
            [-17, -6793],
            [1768, 5725],
            [2235, -193],
            [1256, 7219],
            [-2976, 4428],
            [-3242, 2901],
            [223, 7936],
            [3284, 5211],
            [3663, -1152],
            [2811, -3170],
            [3774, -8096],
            [-2465, -3528],
            [5166, -1452],
            [-12, -7344],
            [3712, 5628],
            [3321, -4622],
            [-828, -5326],
            [2687, -4845],
            [2901, 5190],
            [2026, 6198],
            [152, 7881],
            [3947, -551],
            [4107, -1056],
            [3728, -3564],
            [167, -3564],
            [-2067, -3828],
            [1959, -3845],
            [-354, -3493],
            [-5439, -5021],
            [-3863, -1107],
            [-2873, 2161],
            [-828, -3605],
            [-2677, -6056],
            [-811, -3140],
            [-3221, -4859],
            [-3977, -476],
            [-2193, -3034],
            [-183, -4668],
            [-3232, -898],
            [-3399, -5820],
            [-3012, -8086],
            [-1077, -5661],
            [-154, -8340],
            [4082, -1197],
            [1251, -6725],
            [1299, -5447],
            [3887, 1419],
            [5162, -3109],
            [2777, -2730],
            [1987, -3393],
            [3481, -1977],
            [2943, -3025],
            [4587, -414],
            [3021, -694],
            [-454, -6219],
            [865, -7218],
            [2012, -8037],
            [4132, -6818],
            [2139, 2338],
            [1503, 7383],
            [-1451, 11341],
            [-1959, 3779],
            [4447, 3366],
            [3147, 5034],
            [1540, 5004],
            [-227, 4799],
            [-1887, 6100],
            [-3374, 5404],
            [3278, 7526],
            [-1211, 6501],
            [-928, 11214],
            [1934, 1658],
            [4762, -1954],
            [2856, -698],
            [2301, 1886],
            [2587, -2432],
            [3421, -4163],
            [842, -2788],
            [4954, -544],
            [-83, -6033],
            [923, -9076],
            [2537, -1122],
            [2014, -4230],
            [4022, 3987],
            [2657, 7924],
            [1838, 3338],
            [2163, -6412],
            [3618, -9160],
            [3072, -8614],
            [-1117, -4510],
            [3695, -4050],
            [2496, -4103],
            [4430, -1857],
            [1783, -2291],
            [1101, -6076],
            [2163, -954],
            [1116, -2708],
            [203, -8069],
            [-2016, -2700],
            [-1994, -2520],
            [-4578, -2553],
            [-3495, -5899],
            [-4696, -1166],
            [-5941, 1512],
            [-4169, 52],
            [-2877, -497],
            [-2326, -5152],
            [-3541, -3182],
            [-4007, -9504],
            [-3197, -6630],
            [2359, 1181],
            [4459, 9435],
            [5827, 5982],
            [4156, 716],
            [2459, -3521],
            [-2624, -4823],
            [881, -7740],
            [906, -5418],
            [3608, -3586],
            [4591, 1039],
            [2785, 8073],
            [193, -5209],
            [1794, -2601],
            [-3437, -4704],
            [-6152, -4274],
            [-2755, -2905],
            [-3104, -5173],
            [-2109, 527],
            [-107, 6079],
            [4823, 5938],
            [-4446, -235],
            [-3087, -875]
        ],
        [
            [182869, 924429],
            [-1387, -3366],
            [6182, 2173],
            [3863, -3626],
            [3138, 3668],
            [2539, -2354],
            [2273, -7055],
            [1395, 2977],
            [-1973, 7354],
            [2444, 1051],
            [2761, -1148],
            [3111, -2897],
            [1744, -6996],
            [861, -5066],
            [4665, -3556],
            [5013, -3400],
            [-302, -3158],
            [-4561, -578],
            [1772, -2760],
            [-936, -2634],
            [-5027, 1129],
            [-4778, 1938],
            [-3229, -436],
            [-5215, -2436],
            [-7039, -1077],
            [-4942, -678],
            [-1505, 3388],
            [-3792, 1958],
            [-2466, -803],
            [-3423, 5686],
            [1848, 765],
            [4288, 1226],
            [3916, -323],
            [3626, 1250],
            [-5372, 1677],
            [-5936, -571],
            [-3939, 145],
            [-1465, 2647],
            [6442, 2872],
            [-4285, -100],
            [-4850, 1891],
            [2331, 5380],
            [1934, 2859],
            [7437, 4371],
            [2839, -1387]
        ],
        [
            [209722, 926573],
            [-2444, -4740],
            [-4334, 5027],
            [945, 1005],
            [3722, 288],
            [2111, -1580]
        ],
        [
            [287944, 924294],
            [246, -1984],
            [-2953, 209],
            [-2992, 152],
            [-3040, -966],
            [-805, 436],
            [-3056, 3808],
            [117, 2585],
            [1336, 478],
            [6357, -774],
            [4790, -3944]
        ],
        [
            [259549, 924687],
            [2189, -4476],
            [2567, 5789],
            [7040, 2949],
            [4766, -7428],
            [-414, -4701],
            [5495, 2085],
            [2628, 2854],
            [6163, -3633],
            [3826, -3422],
            [360, -3133],
            [5158, 1623],
            [2895, -4574],
            [6705, -2836],
            [2420, -2894],
            [2628, -6721],
            [-5101, -3345],
            [6543, -4690],
            [4410, -1577],
            [3992, -6600],
            [4370, -476],
            [-865, -5040],
            [-4876, -8342],
            [-3417, 3069],
            [-4368, 6908],
            [-3594, -899],
            [-351, -4115],
            [2922, -4174],
            [3771, -3304],
            [1144, -1908],
            [1807, -7107],
            [-956, -5162],
            [-3504, 1946],
            [-6967, 5749],
            [3927, -6188],
            [2892, -4337],
            [452, -2507],
            [-7532, 2867],
            [-5962, 4169],
            [-3366, 3498],
            [970, 2026],
            [-4145, 3691],
            [-4045, 3483],
            [45, -2082],
            [-8032, -1146],
            [-2350, 2466],
            [1829, 5287],
            [5220, 128],
            [5718, 918],
            [-928, 2563],
            [969, 3582],
            [3594, 6994],
            [-764, 3177],
            [-1071, 2460],
            [-4254, 3484],
            [-5628, 2442],
            [1779, 1817],
            [-2940, 4465],
            [-2448, 409],
            [-2191, 2444],
            [-1487, -2119],
            [-5036, -923],
            [-10109, 1604],
            [-5876, 2107],
            [-4504, 1082],
            [-2311, 2523],
            [2905, 3276],
            [-3946, 31],
            [-880, 7271],
            [2135, 6422],
            [2856, 2933],
            [7173, 1910],
            [-2045, -4642]
        ],
        [
            [221232, 929617],
            [3313, -1512],
            [4955, 909],
            [722, -2082],
            [-2593, -3443],
            [4204, -3092],
            [-500, -6463],
            [-4555, -2780],
            [-2675, 600],
            [-1922, 2742],
            [-6903, 5542],
            [55, 2298],
            [5671, -891],
            [-3060, 4697],
            [3288, 3475]
        ],
        [
            [241121, 921919],
            [-2980, -5367],
            [-3169, 268],
            [-1733, 6308],
            [43, 3570],
            [1452, 3052],
            [2756, 1956],
            [5788, -250],
            [5306, -1747],
            [-4151, -6395],
            [-3312, -1395]
        ],
        [
            [165389, 911949],
            [-7312, -3461],
            [-1466, 3148],
            [-6414, 3797],
            [1192, 3041],
            [1924, 5245],
            [2409, 4721],
            [-2716, 4400],
            [9389, 1121],
            [3967, -1490],
            [7094, -399],
            [2698, -2081],
            [2982, -3022],
            [-3492, -1811],
            [-6811, -5048],
            [-3444, -5027],
            [0, -3134]
        ],
        [
            [239964, 937775],
            [-1511, -2784],
            [-4033, 535],
            [-3367, 1873],
            [1478, 3233],
            [3994, 1934],
            [2425, -2518],
            [1014, -2273]
        ],
        [
            [226389, 950270],
            [2123, -3328],
            [87, -3685],
            [-1266, -5338],
            [-4580, -737],
            [-2986, 1149],
            [58, 4189],
            [-4553, -553],
            [-176, 5550],
            [2988, -225],
            [4184, 2449],
            [3907, -415],
            [214, 944]
        ],
        [
            [199413, 946548],
            [1088, -2558],
            [2474, 1202],
            [2911, -312],
            [489, -3518],
            [-1690, -3406],
            [-9407, -1114],
            [-7009, -3110],
            [-4224, -163],
            [-354, 2341],
            [5769, 3176],
            [-12550, -855],
            [-3884, 1283],
            [3790, 7015],
            [2615, 2009],
            [7817, -2423],
            [4935, -4253],
            [4853, -545],
            [-3973, 6869],
            [2545, 2617],
            [2868, -832],
            [937, -3423]
        ],
        [
            [236988, 952983],
            [3084, -2309],
            [5469, 16],
            [2398, -2362],
            [-633, -2697],
            [3188, -1625],
            [1764, -1706],
            [3747, -316],
            [4053, -601],
            [4415, 1557],
            [5656, 611],
            [4514, -505],
            [2975, -2708],
            [621, -2971],
            [-1733, -1909],
            [-4142, -1543],
            [-3556, 873],
            [-7968, -1106],
            [-5702, -127],
            [-4485, 885],
            [-7382, 2314],
            [-961, 3942],
            [-338, 3561],
            [-2788, 3135],
            [-5747, 877],
            [-3219, 2224],
            [1045, 2946],
            [5725, -456]
        ],
        [
            [177226, 956914],
            [-381, -5517],
            [-2140, -2491],
            [-2595, -351],
            [-5164, -3073],
            [-4446, -1100],
            [-3764, 1554],
            [4715, 5372],
            [5705, 4651],
            [4260, -100],
            [3810, 1055]
        ],
        [
            [239333, 956015],
            [-1265, -206],
            [-5206, 458],
            [-741, 2007],
            [5594, -105],
            [1950, -1333],
            [-332, -821]
        ],
        [
            [193925, 957286],
            [-5178, -2067],
            [-4120, 2320],
            [2249, 2289],
            [4056, 732],
            [3917, -1125],
            [-924, -2149]
        ],
        [
            [195380, 963784],
            [-3384, -1400],
            [-4613, 7],
            [45, 1024],
            [2850, 2150],
            [1489, -327],
            [3613, -1454]
        ],
        [
            [233805, 959870],
            [-4110, -1481],
            [-2263, 1668],
            [-1190, 2694],
            [-220, 2972],
            [3597, -287],
            [1619, -475],
            [3319, -2496],
            [-752, -2595]
        ],
        [
            [222055, 961794],
            [1081, -2996],
            [-4536, 800],
            [-4572, 2328],
            [-6184, 267],
            [2682, 2133],
            [-3358, 1730],
            [-202, 2752],
            [5452, -978],
            [7512, -2620],
            [2125, -3416]
        ],
        [
            [258278, 971382],
            [3349, -2320],
            [-3815, -2137],
            [-5133, -5401],
            [-4914, -516],
            [-5756, 919],
            [-2985, 2927],
            [43, 2605],
            [2196, 1913],
            [-5080, -55],
            [-3061, 2388],
            [-1760, 3251],
            [1925, 3193],
            [1925, 2190],
            [2848, 502],
            [-1214, 1646],
            [6460, 366],
            [3547, -3834],
            [4675, -1538],
            [4555, -1360],
            [2195, -4739]
        ],
        [
            [309722, 996130],
            [7424, -563],
            [5965, -919],
            [5083, -1949],
            [-122, -1917],
            [-6778, -3115],
            [-6720, -1454],
            [-2512, -1608],
            [6048, 37],
            [-6555, -4356],
            [-4527, -2033],
            [-4751, -5866],
            [-5730, -1191],
            [-1770, -1465],
            [-8410, -768],
            [3829, -901],
            [-1920, -1283],
            [2297, -3542],
            [-2639, -2462],
            [-4291, -2032],
            [-1317, -2810],
            [-3880, -2147],
            [388, -1625],
            [4747, 278],
            [60, -1753],
            [-7423, -4307],
            [-7258, 1981],
            [-8160, -1113],
            [-4134, 869],
            [-5251, 376],
            [-349, 3445],
            [5135, 1624],
            [-1368, 5182],
            [1695, 505],
            [7426, -3099],
            [-3788, 4605],
            [-4505, 1377],
            [2250, 2779],
            [4926, 1710],
            [788, 2503],
            [-3923, 2806],
            [-1179, 3700],
            [7592, -309],
            [2194, -778],
            [4335, 2616],
            [-6255, 830],
            [-9720, -457],
            [-4910, 2437],
            [-2315, 2903],
            [-3244, 2105],
            [-609, 2450],
            [4131, 1370],
            [3244, 233],
            [5450, 1164],
            [4084, 2676],
            [3444, -375],
            [3000, -2011],
            [2111, 3878],
            [3667, 1149],
            [4981, 794],
            [8491, 298],
            [1476, -776],
            [8020, 1215],
            [6016, -455],
            [6016, -456]
        ],
        [
            [529007, 736087],
            [-220, -2944],
            [-1224, -1211],
            [-2056, 900],
            [-601, -2896],
            [-1323, -228],
            [-482, 1138],
            [-1557, -2436],
            [-1339, -341],
            [-1196, 1538]
        ],
        [
            [519009, 729607],
            [-954, 3149],
            [-1326, -1125],
            [41, 3252],
            [2031, 4035],
            [-89, 1824],
            [1266, -661],
            [762, 1227]
        ],
        [
            [520740, 741308],
            [2363, -50],
            [570, 1560],
            [2977, -2196]
        ],
        [
            [314000, 5135],
            [-920, -2905],
            [-2382, -2230],
            [-1365, 228],
            [-1645, 582],
            [-2016, 2159],
            [-2910, 1038],
            [-3495, 4012],
            [-2837, 3861],
            [-3826, 8042],
            [2290, -1507],
            [3900, -4797],
            [3684, -2577],
            [1433, 3292],
            [901, 4916],
            [2561, 2966],
            [1977, -848]
        ],
        [
            [309523, 23786],
            [-2471, 54],
            [-1338, -1766],
            [-2506, -2595],
            [-448, -6707],
            [-1176, -167],
            [-3134, 2334],
            [-3180, 5001],
            [-3456, 4110],
            [-870, 4548],
            [787, 4208],
            [-1397, 4775],
            [-357, 12241],
            [1182, 6907],
            [2934, 5548],
            [-4217, 2094],
            [2646, 6346],
            [945, 11927],
            [3087, -2527],
            [1452, 14876],
            [-1864, 1909],
            [-868, -8964],
            [-1752, 1012],
            [872, 10269],
            [947, 13304],
            [1277, 4908],
            [-800, 7008],
            [-230, 8090],
            [1171, 233],
            [1704, 11597],
            [1921, 11488],
            [1176, 10701],
            [-640, 10758],
            [829, 5925],
            [-332, 8863],
            [1624, 8768],
            [500, 13891],
            [892, 14915],
            [869, 16054],
            [-203, 11754],
            [-579, 10114]
        ],
        [
            [304520, 267590],
            [1428, 1834],
            [745, 3681]
        ],
        [
            [806497, 533475],
            [-2400, -3452],
            [-2278, 2226],
            [-80, 6178],
            [1369, 3254],
            [3035, 2012],
            [1597, -171],
            [620, -2740],
            [-1220, -3160],
            [-643, -4147]
        ],
        [
            [875072, 747467],
            [-1460, -6462],
            [-1079, -2628],
            [-952, -7867]
        ],
        [
            [871581, 730510],
            [-1868, -6986],
            [-3371, 1272],
            [-2384, -2536],
            [732, -6150],
            [-400, -8485],
            [-1419, -194]
        ],
        [
            [862871, 707431],
            [17, -3648]
        ],
        [
            [862888, 703783],
            [0, 1]
        ],
        [
            [862888, 703784],
            [-1794, 4239],
            [-1104, -4024],
            [-4290, -3093],
            [434, -3788],
            [-2402, 261],
            [-1319, 2251],
            [-1908, -5093],
            [-3062, -3860],
            [-2262, -4606]
        ],
        [
            [845181, 686071],
            [-3883, -2087],
            [-2045, -3356],
            [-2991, -1960],
            [1476, 3327],
            [-581, 2797],
            [2199, 4827],
            [-1467, 3762],
            [-2421, -2535],
            [-3137, -4993],
            [-1711, -4637],
            [-2724, -345],
            [-1417, -3351],
            [1464, -4856],
            [2273, -1178],
            [93, -3224],
            [2198, -2097],
            [3113, 5128],
            [2466, -2796],
            [1796, -191],
            [450, -3762],
            [-3932, -2006],
            [-1298, -3877],
            [-2701, -3602],
            [-1426, -5026],
            [2990, -3946],
            [1091, -7064],
            [1690, -6580],
            [1887, -5516],
            [-45, -5334],
            [-1744, -1961],
            [665, -3830],
            [1635, -2229],
            [-427, -5849],
            [-706, -5691],
            [-1552, -645],
            [-2028, -7773],
            [-2250, -9425],
            [-2579, -8570],
            [-3821, -6627],
            [-3863, -6044],
            [-3130, -824],
            [-1698, -3191],
            [-961, 2331],
            [-1571, -3568],
            [-3882, -3597],
            [-2939, -1101],
            [-949, -7584],
            [-1539, -421],
            [-729, 5212],
            [658, 2778],
            [-3727, 2299],
            [-1312, -1170]
        ],
        [
            [800139, 554113],
            [-2797, 1864],
            [-1323, 2918],
            [440, 4136],
            [-2540, 1312],
            [-1339, 2694],
            [-2367, -3827],
            [-2701, -829],
            [-2216, 36],
            [-1490, -1752]
        ],
        [
            [783806, 560665],
            [-1440, -1052],
            [420, -8214],
            [-1481, 196],
            [-250, 1687]
        ],
        [
            [781055, 553282],
            [-83, 2968],
            [-2038, -2090],
            [-1203, 1322],
            [-2063, 2695],
            [809, 5966],
            [-1759, 1390],
            [-662, 6611],
            [-2933, -1191],
            [333, 8518],
            [2632, 5997],
            [111, 5923],
            [-81, 5495],
            [-1213, 1712],
            [-928, 4228],
            [-1625, -534]
        ],
        [
            [770352, 602292],
            [-2995, 1073],
            [938, 3016],
            [-1302, 4465],
            [-1980, -3024],
            [-2330, 1765],
            [-3202, -4573],
            [-2529, -5341],
            [-2240, -899]
        ],
        [
            [746705, 595382],
            [-233, 5655],
            [-1694, -1510]
        ],
        [
            [744778, 599527],
            [-3238, 702],
            [-3143, 1646],
            [-2254, 3154],
            [-2159, 1416],
            [-932, 3449],
            [-1561, 1030],
            [-2804, 4679],
            [-2227, 2208],
            [-1152, -1718]
        ],
        [
            [725308, 616093],
            [-3860, 5021],
            [-2730, 4547],
            [-779, 7915],
            [1994, -965],
            [91, 3667],
            [-1105, 3675],
            [281, 5858],
            [-2986, 8417]
        ],
        [
            [716214, 654228],
            [-4568, 2904],
            [-822, 5517],
            [-2052, 3348]
        ],
        [
            [708277, 668058],
            [-417, 4093],
            [97, 2793],
            [-1687, 1634],
            [-913, -723],
            [-704, 6646]
        ],
        [
            [704653, 682501],
            [791, 1642],
            [-383, 1681],
            [2652, 3392],
            [1919, 1405],
            [2941, -963],
            [1050, 4585],
            [3563, 854],
            [990, 2850],
            [4377, 3890],
            [391, 1623]
        ],
        [
            [722944, 703460],
            [-222, 4094],
            [1906, 1869],
            [-2501, 12474],
            [5503, 2869],
            [1422, 1599],
            [2004, 12857],
            [5511, -2363],
            [1545, 3245],
            [132, 7201],
            [2307, 671],
            [2115, 4781]
        ],
        [
            [742666, 752757],
            [1087, 591]
        ],
        [
            [743753, 753348],
            [729, -5011],
            [2335, -3808],
            [3962, -2697],
            [1917, -5784],
            [-1070, -8390],
            [1000, -3114],
            [3301, -1228],
            [3741, -1002],
            [3356, -4475],
            [1717, -797],
            [1265, -6620],
            [1630, -4264],
            [3063, 167],
            [5733, -1610],
            [3695, 999],
            [2742, -1070],
            [4109, -4362],
            [3361, 7],
            [1230, -2233],
            [3234, 3855],
            [4487, 2494],
            [4164, 272],
            [3245, 2526],
            [1994, 3846],
            [1944, 2415],
            [-450, 2370],
            [-887, 2760],
            [1458, 4629],
            [1564, -650],
            [2855, -1456],
            [2768, 3813],
            [4235, 2782],
            [2035, 4746],
            [1956, 2044],
            [4035, 952],
            [2191, -809],
            [304, 2552],
            [-2517, 5019],
            [-2229, 2296],
            [-2135, -2650],
            [-2740, 1118],
            [-1573, -911],
            [-715, 2936],
            [1962, 7175],
            [1353, 5414]
        ],
        [
            [824107, 757594],
            [3335, -2711],
            [3914, 4538]
        ],
        [
            [831356, 759421],
            [-25, 3159],
            [2507, 7617]
        ],
        [
            [833838, 770197],
            [1545, 2302],
            [-34, 3965],
            [-1525, 1706],
            [2295, 3573],
            [3452, 1295],
            [3682, 194],
            [4158, -2138],
            [2439, -2644],
            [1717, -7243],
            [1041, -3090],
            [967, -4410],
            [1028, -7034],
            [4835, -2295],
            [3290, -5105],
            [1125, -6747],
            [4220, -9],
            [2408, 2833],
            [4591, 2117]
        ],
        [
            [492145, 468589],
            [737, -10218],
            [-1170, -6031],
            [-725, -8109],
            [1205, -6186],
            [-126, -2833]
        ],
        [
            [492066, 435212],
            [-1264, -73],
            [-1938, 1404],
            [-1781, -83],
            [-3290, -1254],
            [-1929, -2072],
            [-2750, -2634],
            [-537, 188]
        ],
        [
            [478577, 430688],
            [213, 5914],
            [266, 899],
            [-85, 2830],
            [-1176, 3007],
            [-883, 480],
            [-809, 1972],
            [604, 3190],
            [-278, 3471],
            [128, 2089]
        ],
        [
            [476557, 454540],
            [441, 8],
            [163, 3132],
            [-214, 1387],
            [265, 998],
            [1032, 863],
            [-686, 5749],
            [-641, 2968],
            [223, 2438],
            [554, 556]
        ],
        [
            [477694, 472639],
            [362, 653],
            [769, -1079],
            [2145, -59],
            [512, 2096],
            [479, -140],
            [802, 809],
            [430, -3071],
            [648, 906],
            [1146, 1064]
        ],
        [
            [544480, 415630],
            [-200, -3877],
            [-2207, 1697],
            [-2246, 1895],
            [-3506, 281]
        ],
        [
            [536321, 415626],
            [-346, 392],
            [-1644, -925],
            [-1688, 962],
            [-1320, -472]
        ],
        [
            [531323, 415583],
            [-4520, 164]
        ],
        [
            [526803, 415747],
            [405, 5669],
            [-1085, 4748],
            [-1268, 1218],
            [-564, 3218],
            [-711, 1029],
            [31, 1985]
        ],
        [
            [523611, 433614],
            [715, 5082],
            [1321, 6928],
            [804, 65],
            [1655, 4203],
            [1053, 119],
            [1559, -2951],
            [1909, 2420],
            [259, 2984],
            [624, 2893],
            [431, 3633],
            [1485, 2958],
            [561, 5027],
            [589, 1600],
            [392, 3733],
            [734, 4583],
            [2340, 5556],
            [147, 2387],
            [303, 1297],
            [-1100, 2860]
        ],
        [
            [539392, 488991],
            [89, 2286],
            [785, 412]
        ],
        [
            [540266, 491689],
            [1104, -4598],
            [185, -4764],
            [-101, -4770],
            [1512, -6528],
            [-1552, 71],
            [-783, -512],
            [-1266, 722],
            [-604, -3389],
            [1640, -4191],
            [1210, -1219],
            [391, -2973],
            [875, -4950],
            [-435, -1945]
        ],
        [
            [576039, 436931],
            [1683, -5928],
            [1247, -871],
            [743, 1206],
            [1285, -472],
            [1547, 1519],
            [660, -3067],
            [2445, -4772]
        ],
        [
            [585649, 424546],
            [-168, -8397],
            [1113, -972],
            [-893, -2550],
            [-1067, -1907],
            [-1062, -3745],
            [-584, -3339],
            [-157, -5764],
            [-643, -2744],
            [-23, -5413]
        ],
        [
            [582165, 389715],
            [-799, -2002],
            [-103, -4273],
            [-382, -554],
            [-257, -3928]
        ],
        [
            [581348, 374449],
            [-12, 84],
            [-498, -11479],
            [750, -4039],
            [-496, -3027],
            [953, -5143],
            [1696, -3914],
            [362, -3943],
            [804, -1915],
            [-125, -1211]
        ],
        [
            [584782, 339862],
            [-488, 326],
            [-3731, -1212],
            [-745, -858],
            [-791, -4584],
            [622, -3167],
            [-494, -8502],
            [-344, -7208],
            [751, -1278],
            [1942, -2795],
            [762, 1306],
            [232, -7743],
            [-2126, 59],
            [-1140, 3952],
            [-1024, 3060],
            [-2129, 1004],
            [-623, 3762],
            [-1698, -2266],
            [-2224, 1001],
            [-929, 3260],
            [-1763, 663],
            [-1302, -173],
            [-160, 2232],
            [-958, 180]
        ],
        [
            [534228, 355542],
            [-389, 2227]
        ],
        [
            [536098, 365014],
            [730, -732],
            [950, 2749],
            [1513, -71],
            [178, -2033],
            [1038, -1272],
            [1634, 4501],
            [1618, 3507],
            [702, 2298],
            [-93, 5908],
            [1207, 6976],
            [1273, 3699],
            [1828, 3461],
            [320, 2291],
            [69, 2633],
            [453, 2492],
            [-146, 4070],
            [346, 6363],
            [543, 4481],
            [832, 3839],
            [165, 4337]
        ],
        [
            [533097, 363169],
            [-2281, 7606]
        ],
        [
            [530816, 370775],
            [2114, 3963],
            [-1047, 4749],
            [952, 1805],
            [1875, 880],
            [221, 3182],
            [1484, -3448],
            [2452, -302],
            [852, 3393],
            [351, 4774],
            [-303, 5607],
            [-1314, 4247],
            [1203, 8317],
            [-694, 1427],
            [-2066, -585],
            [-777, 3710],
            [202, 3132]
        ],
        [
            [301856, 483912],
            [-1784, -1204],
            [-704, -3590],
            [-1076, -2059],
            [-807, -2669],
            [-340, -5124],
            [-770, -4199],
            [1434, -481],
            [356, -3302],
            [613, -1580],
            [219, -2891],
            [-330, -2658],
            [98, -1499],
            [684, -598],
            [661, -2505],
            [3572, 691],
            [1614, -915],
            [1955, -6180],
            [1123, 768],
            [2001, -384],
            [1583, 819],
            [982, -1234],
            [-500, -3868],
            [-620, -2411],
            [-218, -5150],
            [559, -4771],
            [790, -2134],
            [95, -1608],
            [-1407, -3575],
            [1008, -1582],
            [738, -2511],
            [847, -7161]
        ],
        [
            [305851, 368481],
            [-1390, 3818],
            [-830, 170],
            [1792, 7308],
            [-2127, 3363],
            [-1668, -617],
            [-1003, 1242],
            [-1530, -1899],
            [-2069, 900],
            [-1636, 7529],
            [-1286, 1850],
            [-887, 3390],
            [-1847, 3401],
            [-740, -681]
        ],
        [
            [290630, 398255],
            [-1190, 1700],
            [-1363, 2379],
            [-789, -1142],
            [-2358, 996],
            [-676, 3089],
            [-518, -114],
            [-2779, 4100]
        ],
        [
            [280957, 409263],
            [-377, 2229],
            [1037, 539],
            [-123, 3597],
            [651, 2601],
            [1378, 482],
            [1170, 4512],
            [1063, 3768],
            [-1024, 1708],
            [524, 4168],
            [-626, 6569],
            [595, 1886],
            [-438, 6073],
            [-1125, 3825]
        ],
        [
            [283662, 451220],
            [356, 3491],
            [895, -516],
            [524, 2134],
            [-645, 4230],
            [337, 1050]
        ],
        [
            [285129, 461609],
            [1436, -228],
            [2084, 5013],
            [1143, 764],
            [28, 2375],
            [512, 6068],
            [1593, 3332],
            [1750, 137],
            [221, 1497],
            [2174, -600],
            [2186, 3626],
            [1082, 1606],
            [1345, 3459],
            [984, -440],
            [729, -1889],
            [-540, -2417]
        ],
        [
            [267623, 477897],
            [704, -3901],
            [1074, -2890],
            [1304, -3065]
        ],
        [
            [270705, 468041],
            [-1074, -642],
            [16, -2890],
            [577, -1067],
            [-415, -851],
            [108, -1299],
            [-232, -1457],
            [-146, -1425]
        ],
        [
            [269539, 458410],
            [-1507, 1594],
            [-564, 1507],
            [320, 1247],
            [-101, 1586],
            [-770, 1719],
            [-1093, 1412],
            [-957, 920],
            [-182, 2101],
            [-729, 1283],
            [179, -2088],
            [-554, -1716],
            [-635, 1993],
            [-893, 709],
            [-379, 1448],
            [15, 2186],
            [368, 2262],
            [-784, 1012],
            [636, 1387]
        ],
        [
            [261909, 478972],
            [419, 924],
            [1830, -1901],
            [639, 936],
            [881, -600],
            [460, -1477],
            [820, -479],
            [665, 1522]
        ],
        [
            [278668, 562823],
            [1105, -2629],
            [2595, 811],
            [984, -1687],
            [2352, -4447],
            [1730, -3239],
            [914, 99],
            [1657, -1465],
            [-203, -2022],
            [2048, -295],
            [2100, -2939],
            [-330, -1683],
            [-1847, -911],
            [-1870, -357],
            [-1913, 568],
            [-3978, -699],
            [1862, 4006],
            [-1132, 1865],
            [-1790, 480],
            [-960, 2073],
            [-659, 4090],
            [-1569, -280],
            [-2591, 1926],
            [-833, 1506],
            [-3621, 1113],
            [-969, 1400],
            [1041, 1795],
            [-2724, 367],
            [-1996, -3731],
            [-1151, -100],
            [-398, -1753],
            [-1375, -785],
            [-1189, 681],
            [1467, 2218],
            [602, 2591],
            [1255, 1597],
            [1419, 1400],
            [2103, 687],
            [673, 789],
            [2399, -512],
            [2183, -81],
            [2609, -2447]
        ],
        [
            [594371, 651100],
            [-298, 252],
            [-531, -544],
            [-416, 150],
            [-138, -275],
            [-55, 725],
            [-201, 441],
            [-535, 74],
            [-754, -612],
            [-522, 375]
        ],
        [
            [590921, 651686],
            [196, 39],
            [402, 1732],
            [2000, -97],
            [2526, 2143],
            [-1877, -3058],
            [203, -1345]
        ],
        [
            [594371, 651100],
            [86, -577],
            [-2847, -2917],
            [-1360, 932],
            [-649, 2883],
            [1320, 265]
        ],
        [
            [541713, 766342],
            [1317, -2312],
            [2077, -625],
            [-174, -1976],
            [1509, -1485],
            [415, 1854],
            [1905, -803],
            [264, -2248],
            [2065, -434],
            [1278, -3536]
        ],
        [
            [552369, 754777],
            [-828, -9],
            [-430, -1292],
            [-638, -313],
            [-182, -1634],
            [-532, -341],
            [-75, -668],
            [-948, -742],
            [-1231, 121],
            [-394, -1579]
        ],
        [
            [537766, 750332],
            [-1568, 3087],
            [-1418, 1726],
            [-294, 3028],
            [-486, 2134],
            [2018, 1564],
            [1032, 1789],
            [1995, 1391],
            [696, 1367],
            [733, -826],
            [1239, 750]
        ],
        [
            [539221, 785374],
            [649, -3654],
            [-775, -1917],
            [1009, -2559],
            [687, -3842],
            [-216, -2475],
            [1138, -4585]
        ],
        [
            [520740, 741308],
            [353, 5116],
            [1404, 4917],
            [-4002, 1323],
            [-1311, 1880]
        ],
        [
            [517184, 754544],
            [156, 3148],
            [-554, 1622]
        ],
        [
            [517101, 764166],
            [-466, 7525],
            [1668, 3],
            [704, 2703],
            [693, 6575],
            [-520, 2428]
        ],
        [
            [519180, 783400],
            [543, 1521],
            [2322, 390],
            [515, -1583],
            [1886, 3540],
            [-635, 2692],
            [-128, 4072]
        ],
        [
            [523683, 794032],
            [2100, -947],
            [1777, 1093]
        ],
        [
            [527560, 794178],
            [49, -2775],
            [2807, -1674],
            [-29, -2548],
            [2824, 1348],
            [1562, 1967],
            [3136, -2835],
            [1312, -2287]
        ],
        [
            [619847, 481655],
            [-1023, -3843]
        ],
        [
            [618824, 477812],
            [-616, 1280],
            [-669, -509],
            [-1552, 120],
            [-44, 2184],
            [-217, 1983],
            [940, 3366],
            [977, 3176]
        ],
        [
            [617643, 489412],
            [1189, -624],
            [837, 1754]
        ],
        [
            [619669, 490542],
            [658, -2222],
            [-88, -2982],
            [-1584, -1718],
            [1192, -1965]
        ],
        [
            [535249, 798680],
            [-1666, -5817],
            [-2907, 4056],
            [-388, 2981],
            [4075, 2380],
            [886, -3600]
        ],
        [
            [523683, 794032],
            [-1127, 3985],
            [-84, 7341],
            [462, 1939],
            [797, 2154],
            [2448, 446],
            [975, 1981],
            [2234, 2026],
            [-94, -3694],
            [-822, -2338],
            [333, -2011],
            [1506, -1087],
            [-679, -2709],
            [-827, 780],
            [-2000, -5171],
            [755, -3496]
        ],
        [
            [300810, 528927],
            [57, 1951],
            [-715, 2156],
            [677, 1210],
            [213, 2760],
            [-243, 3911]
        ],
        [
            [300799, 540915],
            [347, 1224],
            [2168, -33],
            [1646, -1848],
            [732, 180],
            [504, -2547],
            [1520, 143],
            [-89, -2140],
            [1235, -260],
            [1366, -2634],
            [-1032, -2923],
            [-1321, 1562],
            [-1275, -301],
            [-914, 341],
            [-501, -1309],
            [-1066, -443],
            [-423, 1742],
            [-918, -1031],
            [-1112, -4917],
            [-715, 1142],
            [-141, 2064]
        ],
        [
            [523391, 664657],
            [-564, -3685],
            [440, -6846],
            [-654, -5922],
            [-1712, -4006],
            [245, -5409],
            [2271, -4278],
            [24, -1738],
            [1713, -2898],
            [1185, -12891]
        ],
        [
            [526339, 616984],
            [898, -6340],
            [151, -3337],
            [-489, -5858],
            [201, -3274],
            [-353, -3930],
            [242, -4515],
            [-1102, -3001],
            [1642, -5234],
            [105, -3077],
            [987, -4005],
            [1299, 1316],
            [2192, -3336],
            [1219, -4497]
        ],
        [
            [533331, 567896],
            [-9518, -13687],
            [-8042, -14107],
            [-3918, -3202]
        ],
        [
            [511853, 536900],
            [-3081, -703],
            [-32, 4568],
            [-1286, 1168],
            [-1730, 2054],
            [-660, 3365],
            [-9370, 15668],
            [-9370, 15668]
        ],
        [
            [486324, 578688],
            [-10448, 17386]
        ],
        [
            [475876, 596074],
            [54, 1391],
            [-2, 481]
        ],
        [
            [475928, 597946],
            [-23, 8509],
            [4486, 5299],
            [2773, 1095],
            [2274, 1930],
            [1062, 3595],
            [3248, 2842],
            [120, 5317],
            [1607, 626],
            [1256, 2656],
            [3635, 1210],
            [510, 2791],
            [-732, 1526],
            [-960, 7581],
            [-165, 4367],
            [-1047, 4599]
        ],
        [
            [493972, 651889],
            [2670, 3924],
            [3003, 1249],
            [1754, 2963],
            [2675, 2185],
            [4708, 1280],
            [4595, 583],
            [1401, -1067],
            [2615, 2831],
            [2969, 55],
            [1129, -1671],
            [1900, 436]
        ],
        [
            [290630, 398255],
            [387, -5453],
            [-865, -4669],
            [-3028, -7519],
            [-3341, -2832],
            [-1702, -6248],
            [-525, -4845],
            [-1571, -2954],
            [-1166, 3626],
            [-1122, 776],
            [-1148, -571],
            [-75, 2631],
            [792, 1710],
            [-329, 2989]
        ],
        [
            [276937, 374896],
            [1479, 5367],
            [-601, 3136],
            [-1062, -3335],
            [-1664, 3147],
            [564, 2025],
            [-469, 6517],
            [973, 1083],
            [511, 4473],
            [1051, 4625],
            [-193, 2931],
            [1522, 1540],
            [1909, 2858]
        ],
        [
            [595181, 623531],
            [0, 1]
        ],
        [
            [595181, 623532],
            [1550, -10472]
        ],
        [
            [596731, 613060],
            [276, -1866]
        ],
        [
            [597007, 611194],
            [-781, -2886],
            [-597, -5424],
            [-756, -3739],
            [-648, -1254],
            [-925, 2317],
            [-1254, 3205],
            [-1982, 10293],
            [-286, -651],
            [1151, -7577],
            [1706, -7220],
            [2099, -11185],
            [1026, -3904],
            [892, -4056],
            [2493, -7950],
            [-552, -1252],
            [90, -4667],
            [3235, -6445],
            [488, -1471]
        ],
        [
            [602406, 557328],
            [-11018, 0],
            [-10777, 0],
            [-11167, 0]
        ],
        [
            [569444, 557328],
            [0, 26444],
            [0, 25536],
            [-833, 5785],
            [715, 4433],
            [-430, 3071],
            [1006, 3446]
        ],
        [
            [569902, 626043],
            [3696, 119],
            [2673, -1899],
            [2758, -2122],
            [1286, -1118],
            [2138, 2275],
            [1144, 2058],
            [2449, 592],
            [1976, -907],
            [756, -3562],
            [645, 2347],
            [2226, -1697],
            [2165, -406],
            [1367, 1808]
        ],
        [
            [617643, 489412],
            [-950, 2323],
            [-1142, 4210],
            [-1232, 2307],
            [-718, 2480],
            [-2418, 2879],
            [-1904, 86],
            [-670, 1501],
            [-1629, -1688],
            [-1686, 3260],
            [-867, -5360],
            [-3235, 1501]
        ],
        [
            [601192, 502911],
            [-295, 2875]
        ],
        [
            [600897, 505786],
            [1196, 10552],
            [275, 4773]
        ],
        [
            [602368, 521111],
            [874, 2201],
            [2046, 1181],
            [1406, 4099]
        ],
        [
            [606694, 528592],
            [1613, -8314],
            [765, -6591],
            [1523, -3498],
            [3791, -6783],
            [1544, -4093],
            [1505, -4144],
            [869, -2467],
            [1365, -2160]
        ],
        [
            [494718, 711164],
            [1107, -2792],
            [5114, -3263],
            [1009, 1552],
            [3126, -3248],
            [3220, 931]
        ],
        [
            [508294, 704344],
            [149, -4172],
            [-2633, -4783],
            [-3559, -1517],
            [-248, -2416],
            [-1707, -3981],
            [-1071, -5845],
            [1084, -4104],
            [-1607, -3203],
            [-601, -4668],
            [-2097, -1431],
            [-1967, -5522],
            [-3526, -109],
            [-2647, 136],
            [-1740, -2536],
            [-1061, -2714],
            [-1359, 596],
            [-1029, 2426],
            [-787, 4131],
            [-2593, 1112]
        ],
        [
            [479295, 665744],
            [-232, 2378],
            [1030, 2693],
            [381, 1952],
            [-958, 2135],
            [767, 4718],
            [-1113, 4305],
            [1200, 591],
            [112, 3394],
            [451, 1051],
            [36, 5603],
            [1283, 1944],
            [-776, 3601],
            [-1619, 252],
            [-476, -907],
            [-1640, -9],
            [-697, 3516],
            [-1133, -1047],
            [-1008, -1825]
        ],
        [
            [474903, 700089],
            [140, 5115],
            [-1135, 3115],
            [3930, 5183],
            [3399, -1296],
            [3729, 45],
            [2956, -1226],
            [2307, 377],
            [4489, -238]
        ],
        [
            [577725, 826437],
            [418, -1254],
            [-1976, -4138],
            [823, -6697],
            [-1190, -2279]
        ],
        [
            [575800, 812069],
            [-2291, 13],
            [-2391, 2665],
            [-1217, 881],
            [-2366, -1269]
        ],
        [
            [567535, 814359],
            [323, 4237],
            [-1022, -906],
            [-1763, 2552],
            [-241, 4126],
            [3512, 2001],
            [3500, 1042],
            [3014, -1186],
            [2867, 212]
        ],
        [
            [618824, 477812],
            [-606, -2544],
            [1026, -3954],
            [1025, -3458],
            [1060, -2563],
            [9082, -8521],
            [2337, 44]
        ],
        [
            [632748, 456816],
            [-7850, -21553],
            [-3618, -317],
            [-2476, -5062],
            [-1781, -132],
            [-759, -2264]
        ],
        [
            [616264, 427488],
            [-1899, 1],
            [-1120, 2427],
            [-2537, -3003],
            [-821, -2993],
            [-1853, 565],
            [-615, 828],
            [-650, -198],
            [-878, 73],
            [-3516, 6098],
            [-1934, 0],
            [-949, 2364],
            [0, 4030],
            [-1443, 1205]
        ],
        [
            [598049, 438885],
            [-1641, 7814],
            [-1269, 1665],
            [-487, 2872],
            [-1407, 3500],
            [-1706, 514],
            [946, 4090],
            [1474, 177],
            [415, 2193],
            [-32, 5599]
        ],
        [
            [594342, 467309],
            [-5, 857],
            [822, 7515],
            [1316, 2011],
            [279, 2935],
            [1191, 5486],
            [1676, 3558],
            [1129, 7073],
            [442, 6167]
        ],
        [
            [579421, 895298],
            [-405, -5028],
            [4254, -4785],
            [-2563, -5414],
            [3230, -8174],
            [-1870, -6157],
            [2501, -5344],
            [-1136, -4679],
            [4112, -4920],
            [-1045, -3662],
            [-2580, -4148],
            [-5947, -9167]
        ],
        [
            [577972, 833820],
            [-5042, -571],
            [-4884, -2633],
            [-4520, -1515],
            [-1608, 3918],
            [-2690, 2357],
            [618, 7074],
            [-1349, 6478],
            [1325, 4182],
            [2518, 4510],
            [6355, 7788],
            [1855, 1501],
            [-289, 3037],
            [-3863, 3394]
        ],
        [
            [566398, 873340],
            [-938, 2794],
            [-73, 11058],
            [-4336, 4889],
            [-3703, 3515]
        ],
        [
            [557348, 895596],
            [1665, 1897],
            [3087, -3797],
            [3627, 356],
            [2983, -1736],
            [2648, 3178],
            [1363, 5265],
            [4313, 2434],
            [3564, -2856],
            [-1177, -5039]
        ],
        [
            [995481, 274829],
            [957, -2072],
            [-459, -3749],
            [-1723, -987],
            [-1531, 888],
            [-268, 3157],
            [1072, 2467],
            [1263, -888],
            [689, 1184]
        ],
        [
            [998233, 278697],
            [-1775, -1513],
            [-357, 2677],
            [1389, 1474],
            [880, 394],
            [1629, 2240],
            [0, -3505],
            [-1766, -1767]
        ],
        [
            [230, 280848],
            [-230, -384],
            [0, 3505],
            [574, 332],
            [-344, -3453]
        ],
        [
            [337361, 32399],
            [2222, -3231],
            [-833, -2513],
            [-3750, -2155],
            [-1250, 2514],
            [-2361, -3232],
            [-1389, 3232],
            [3333, 4308],
            [2361, -1795],
            [1667, 2872]
        ],
        [
            [348542, 415948],
            [704, 3065],
            [242, 3271],
            [480, 3076],
            [-1078, 4237]
        ],
        [
            [348890, 429597],
            [-220, 4913],
            [1446, 6174]
        ],
        [
            [350116, 440684],
            [944, -790],
            [2045, -1700],
            [2941, -6061],
            [460, -2941]
        ],
        [
            [526555, 702042],
            [-917, -5547],
            [-1262, 1462],
            [-643, 4832],
            [561, 2668],
            [1789, 2743],
            [472, -6158]
        ],
        [
            [515761, 755016],
            [621, -624],
            [802, 152]
        ],
        [
            [519009, 729607],
            [-114, -2029],
            [817, -2696],
            [-963, -2187],
            [716, -5557],
            [1506, -911],
            [-318, -3117]
        ],
        [
            [520653, 713110],
            [-2517, -4057],
            [-5478, 1945],
            [-4046, -2330],
            [-318, -4324]
        ],
        [
            [494718, 711164],
            [1436, 4307],
            [529, 14307],
            [-2866, 7536],
            [-2049, 3633],
            [-4245, 2762],
            [-280, 5237],
            [3601, 1562],
            [4665, -1848],
            [-880, 8129],
            [2622, -3081],
            [6467, 5600],
            [834, 5884],
            [2430, 1450]
        ],
        [
            [530816, 370775],
            [-2855, 7248],
            [-1836, 5925],
            [-1687, 7418],
            [89, 2386],
            [607, 2296],
            [675, 5228],
            [560, 5324]
        ],
        [
            [526369, 406600],
            [937, 415],
            [4041, -74],
            [-24, 8642]
        ],
        [
            [482783, 786167],
            [-2099, 1481],
            [-1718, -99],
            [572, 3848],
            [-572, 3848]
        ],
        [
            [478966, 795245],
            [2328, 296],
            [2978, -4440],
            [-1489, -4934]
        ],
        [
            [491652, 820402],
            [-2969, -7769],
            [2830, 983],
            [3044, -37],
            [-724, -5851],
            [-2497, -6436],
            [2872, -458],
            [220, -755],
            [2474, -8473],
            [1902, -1153],
            [1709, -8182],
            [792, -2836],
            [3365, -1368],
            [-337, -4592],
            [-1415, -2106],
            [1109, -3715],
            [-2499, -3761],
            [-3716, 67],
            [-4729, -1975],
            [-1295, 1414],
            [-1837, -3365],
            [-2570, 815],
            [-1951, -2742],
            [-1477, 1434],
            [4074, 7543],
            [2487, 1551],
            [-22, 6],
            [-4338, 1196],
            [-786, 2858],
            [2903, 2226],
            [-1522, 3868],
            [528, 4703],
            [4129, -649],
            [4, -1],
            [409, 4169],
            [-1860, 4423],
            [-43, 101],
            [-3373, 1263],
            [-662, 1944],
            [1010, 3209],
            [-914, 1978],
            [-1495, -3395],
            [-163, 6921],
            [-1403, 3662],
            [1009, 7424],
            [2158, 5825],
            [2218, -568],
            [3351, 604]
        ],
        [
            [621544, 706267],
            [486, -1335],
            [1685, 1128]
        ],
        [
            [623715, 706060],
            [2591, -1503],
            [850, -2946],
            [1746, -1665]
        ],
        [
            [621063, 694428],
            [-2676, 3526],
            [-2960, -342]
        ],
        [
            [615427, 697612],
            [415, 3069],
            [-694, 4898],
            [-1606, 2647],
            [-1539, 826],
            [-1017, 2200]
        ],
        [
            [610986, 711252],
            [338, 848],
            [2348, -1228],
            [4090, -1162],
            [3782, -3443]
        ],
        [
            [500066, 478471],
            [-205, -2239],
            [1160, -3703],
            [-5, -5215],
            [265, -5657],
            [696, -2619],
            [-614, -6468],
            [221, -3572],
            [740, -4555],
            [620, -2522]
        ],
        [
            [502944, 441921],
            [-4355, -4203],
            [-1544, -2463],
            [-2503, -2083],
            [-2476, 2040]
        ],
        [
            [468016, 488699],
            [161, -2629],
            [440, 8],
            [725, 957],
            [461, -240],
            [771, -1823],
            [1189, -574],
            [762, 1554],
            [897, 961],
            [667, 1006],
            [556, -189],
            [618, -1577],
            [331, -1981],
            [1138, -3008],
            [-569, -1849],
            [-109, -2336],
            [592, 706],
            [347, -837],
            [-147, -2139],
            [848, -2070]
        ],
        [
            [476557, 454540],
            [-786, 184],
            [-566, -2892],
            [-785, 35],
            [-541, 1530],
            [184, 2884],
            [-1162, 4398],
            [-725, -808],
            [-593, -160]
        ],
        [
            [471583, 459711],
            [-765, -411],
            [31, 2632],
            [-446, 1879],
            [90, 2088],
            [-602, 3018],
            [-773, 2568],
            [-2222, 8],
            [-647, -1353],
            [-766, -163],
            [-474, -1548],
            [-320, -1993],
            [-1485, -3157]
        ],
        [
            [463204, 463279],
            [-1219, 4249],
            [-1080, 2811],
            [-711, 930],
            [-694, 1427],
            [-315, 3173],
            [-406, 1582],
            [-808, 1176]
        ],
        [
            [457971, 478627],
            [1235, 3500],
            [843, -133],
            [724, 1205],
            [613, 12],
            [438, 952],
            [-236, 2379],
            [304, 751],
            [51, 2434]
        ],
        [
            [461943, 489727],
            [1340, -74],
            [1997, -1750],
            [612, 160],
            [209, 799],
            [1514, -568],
            [401, 405]
        ],
        [
            [453218, 493786],
            [355, 3185]
        ],
        [
            [453573, 496971],
            [3025, 206],
            [627, 1700],
            [881, 116],
            [1096, -1767],
            [862, -34],
            [916, 1209],
            [561, -2075],
            [-1202, -1612],
            [-1207, 126],
            [-1191, 1518],
            [-1030, -1659],
            [-498, -59],
            [-667, -1005],
            [-2528, 151]
        ],
        [
            [457971, 478627],
            [-1483, 3002],
            [-1170, 475],
            [-637, 2025],
            [16, 1092],
            [-847, 1524],
            [-177, 1537]
        ],
        [
            [453673, 488282],
            [1472, 1169],
            [920, -231],
            [744, 809],
            [5134, -302]
        ],
        [
            [526369, 406600],
            [-521, 1083],
            [955, 8064]
        ],
        [
            [565833, 655743],
            [1518, -2420],
            [2162, 409],
            [2068, -510],
            [-68, -1249],
            [1514, 861],
            [-347, -2118],
            [-4000, -610],
            [28, 1184],
            [-3389, 1401],
            [514, 3052]
        ],
        [
            [572380, 692503],
            [-1693, 204],
            [-1449, 679],
            [-3364, -1867],
            [1925, -4036],
            [-1411, -1171],
            [-1547, -7],
            [-1469, 3698],
            [-522, -1576],
            [621, -4289],
            [1390, -3370],
            [-1047, -1573],
            [1547, -3310],
            [1375, -2082],
            [41, -4057],
            [-2569, 1903],
            [819, -3663],
            [-1764, -754],
            [1054, -6337],
            [-1845, -90],
            [-2278, 3124],
            [-1042, 5745],
            [-486, 4777],
            [-1083, 3301],
            [-1423, 4095],
            [-188, 2045]
        ],
        [
            [558388, 692637],
            [1817, 635],
            [1059, 1570],
            [1506, -139],
            [457, 1252],
            [529, 238]
        ],
        [
            [572547, 699704],
            [1353, -1902],
            [-860, -4494],
            [-660, -805]
        ],
        [
            [424721, 999098],
            [17375, -5694],
            [-5129, -2765],
            [-10627, -316],
            [-14952, -701],
            [1399, -1282],
            [9833, 792],
            [8367, -2476],
            [5392, 2198],
            [2310, -2575],
            [-3049, -4178],
            [7072, 2671],
            [13487, 2785],
            [8328, -1391],
            [1560, -3068],
            [-11324, -5109],
            [-1569, -1652],
            [-8878, -1242],
            [6433, -344],
            [-3249, -5236],
            [-2237, -4659],
            [88, -7990],
            [3335, -4688],
            [-4339, -297],
            [-4568, -2272],
            [5126, -3805],
            [653, -6102],
            [-2970, -664],
            [3598, -6178],
            [-6170, -515],
            [3221, -2920],
            [-911, -2534],
            [-3916, -1111],
            [-3871, -21],
            [3480, -4864],
            [37, -3197],
            [-5496, 2971],
            [-1430, -1922],
            [3750, -1796],
            [3640, -4388],
            [1053, -5783],
            [-4951, -1384],
            [-2142, 2768],
            [-3434, 4125],
            [950, -4873],
            [-3226, -3776],
            [7320, -305],
            [3829, -392],
            [-7445, -6252],
            [-7550, -5661],
            [-8129, -2480],
            [-3064, -31],
            [-2873, -2767],
            [-3864, -7581],
            [-5975, -5033],
            [-1919, -296],
            [-3698, -1763],
            [-3992, -1678],
            [-2380, -4441],
            [-38, -5034],
            [-1405, -4714],
            [-4530, -5746],
            [1119, -5611],
            [-1249, -5938],
            [-1423, -7011],
            [-3914, -438],
            [-4100, 5864],
            [-5554, 37],
            [-2695, 3937],
            [-1854, 7013],
            [-4813, 8930],
            [-1408, 4678],
            [-379, 6451],
            [-3848, 6627],
            [1001, 5292],
            [-1855, 2531],
            [2747, 8392],
            [4181, 2671],
            [1097, 3003],
            [581, 5611],
            [-3174, -2544],
            [-1512, -1068],
            [-2495, -1023],
            [-3409, 2343],
            [-185, 4878],
            [1087, 3821],
            [2576, 103],
            [5670, -1910],
            [-4775, 4561],
            [-2486, 2458],
            [-2766, -1010],
            [-2319, 1780],
            [3102, 6692],
            [-1690, 2674],
            [-2204, 4963],
            [-3344, 7615],
            [-3536, 2789],
            [32, 3006],
            [-7454, 4202],
            [-5897, 523],
            [-7424, -290],
            [-6778, -527],
            [-3224, 2286],
            [-4827, 4515],
            [7294, 2259],
            [5591, 379],
            [-11886, 1867],
            [-6261, 2932],
            [382, 2790],
            [10517, 3455],
            [10174, 3450],
            [1074, 2613],
            [-7497, 2578],
            [2421, 2863],
            [9617, 5013],
            [4041, 769],
            [-1157, 3227],
            [6579, 1890],
            [8542, 1128],
            [8536, 64],
            [3031, -2236],
            [7369, 3954],
            [6630, -2686],
            [3900, -567],
            [5769, -2335],
            [-6605, 3871],
            [380, 3075],
            [9326, 4288],
            [9747, -323],
            [3543, 2649],
            [9817, 690],
            [22188, -901]
        ],
        [
            [252970, 513432],
            [906, -1299],
            [239, 1070],
            [815, -916]
        ],
        [
            [254930, 512287],
            [-1265, -2740],
            [-1318, -2009],
            [-195, -1380],
            [221, -1409],
            [-577, -1823]
        ],
        [
            [251796, 502926],
            [-650, -442],
            [148, -846],
            [-522, -794],
            [-952, -1812],
            [-86, -1053]
        ],
        [
            [249734, 497979],
            [-1425, 1253],
            [-1733, 130],
            [-1270, 1424],
            [-1494, 2963]
        ],
        [
            [243812, 503749],
            [68, 2092],
            [322, 1684],
            [-395, 1342],
            [1337, 5853],
            [3566, 21],
            [71, 2446],
            [-450, 436],
            [-309, 1556],
            [-1027, 1658],
            [-1034, 2397],
            [1255, 18],
            [2, 4042],
            [2593, 12],
            [2569, -79]
        ],
        [
            [341257, 442239],
            [-444, -6459],
            [-1686, -1874],
            [150, -1694],
            [-513, -3705],
            [1231, -5215],
            [890, -8],
            [364, -4054],
            [1697, -6243]
        ],
        [
            [331295, 436689],
            [-1880, 5449],
            [753, 1977],
            [-55, 3316],
            [1709, 1152],
            [690, 1346],
            [-951, 2664],
            [243, 2618],
            [2200, 4219]
        ],
        [
            [334004, 459430],
            [1824, -2642],
            [1719, -4678],
            [78, -3698],
            [1047, -170],
            [1488, -3503],
            [1097, -2500]
        ],
        [
            [269035, 507031],
            [-952, 147],
            [-385, -978],
            [-964, -938],
            [-702, -5],
            [-614, -913],
            [-556, 324],
            [-473, 1097],
            [-291, -209],
            [-356, -1715],
            [-267, 62],
            [-46, -1478],
            [-969, -1978],
            [-512, -854],
            [-285, -890],
            [-820, 1451],
            [-599, -1916],
            [-580, 51],
            [-651, -170],
            [59, -3531],
            [-407, -64],
            [-348, -1640],
            [-864, -295]
        ],
        [
            [257453, 492589],
            [-479, 2247],
            [-844, 624]
        ],
        [
            [256130, 495460],
            [193, 2876],
            [-377, 778],
            [-572, 512],
            [-1219, -856],
            [-103, 967],
            [-839, 1152],
            [-598, 1433],
            [-819, 604]
        ],
        [
            [254930, 512287],
            [289, -281],
            [609, 1263],
            [795, 103],
            [258, -586],
            [431, 357],
            [1290, -648],
            [1284, 187],
            [894, 795],
            [325, 804],
            [886, -372],
            [664, -488],
            [727, 169],
            [552, 623],
            [1269, -996],
            [440, -159],
            [848, -1342],
            [803, -1610],
            [1010, -1100],
            [731, -1975]
        ],
        [
            [552305, 729016],
            [674, -2781],
            [883, -2047],
            [-1070, -2702]
        ],
        [
            [551555, 705615],
            [-306, -1221]
        ],
        [
            [551249, 704394],
            [-2611, 2657],
            [-1611, 2585],
            [-2540, 2134],
            [-2336, 5285],
            [560, 537],
            [-1266, 3020],
            [-52, 2424],
            [-1786, 1133],
            [-851, -3100],
            [-820, 2404],
            [62, 2493],
            [99, 117]
        ],
        [
            [538097, 726083],
            [1936, -246],
            [508, 1212],
            [945, -1172],
            [1090, -139],
            [-10, 2007],
            [965, 735],
            [270, 2901],
            [2212, 1907]
        ],
        [
            [546013, 733288],
            [882, -884],
            [2077, -3080],
            [2294, -1380],
            [1039, 1072]
        ],
        [
            [300810, 528927],
            [-1845, 1220],
            [-1311, -498],
            [-1695, 520],
            [-1299, -1343],
            [-1488, 2238],
            [245, 2314],
            [2556, -997],
            [2096, -576],
            [1000, 1599],
            [-1268, 3111],
            [21, 2742],
            [-1753, 1120],
            [626, 1983],
            [1694, -317],
            [2410, -1128]
        ],
        [
            [561348, 747065],
            [1543, -1953],
            [193, -1925]
        ],
        [
            [563084, 743187],
            [-1696, -1507],
            [-1315, -4870],
            [-1679, -4869],
            [-2227, -1355]
        ],
        [
            [556167, 730586],
            [-1734, 318],
            [-2128, -1888]
        ],
        [
            [546013, 733288],
            [-540, 2424],
            [-467, 80]
        ],
        [
            [547165, 744919],
            [1414, -1838],
            [1024, -783],
            [2331, 880],
            [224, 1442],
            [1104, 212],
            [1352, 1115],
            [301, -459],
            [1304, 897],
            [651, 1689],
            [911, 439],
            [2975, -2183],
            [592, 735]
        ],
        [
            [835320, 325816],
            [-1168, -137],
            [-3687, 5032],
            [2591, 1412],
            [1459, -2187],
            [972, -2181],
            [-167, -1939]
        ],
        [
            [847134, 335488],
            [282, -1416],
            [51, -2178]
        ],
        [
            [847467, 331894],
            [-1812, -5363],
            [-2378, -1579],
            [-333, 861],
            [250, 2442],
            [1194, 4380],
            [2746, 2853]
        ],
        [
            [827499, 341212],
            [1002, -1915],
            [1716, 586],
            [689, -3053],
            [-3211, -1442],
            [-1924, -964],
            [-1494, 57],
            [955, 4135],
            [1523, 56],
            [744, 2540]
        ],
        [
            [841398, 341222],
            [-407, -3989],
            [-4174, -2039],
            [-3695, 885],
            [-9, 2625],
            [2206, 1493],
            [1740, -2153],
            [1850, 547],
            [2489, 2631]
        ],
        [
            [801731, 350676],
            [5322, -716],
            [612, 2960],
            [5153, -3453],
            [1011, -4654],
            [4167, -1309],
            [3407, -4268],
            [-3169, -2736],
            [-3055, 2893],
            [-2514, -196],
            [-2882, 532],
            [-2600, 1289],
            [-3218, 2743],
            [-2039, 711],
            [-1155, -898],
            [-5066, 2957],
            [-482, 3088],
            [-2542, 528],
            [1906, 6861],
            [3371, -424],
            [2241, -2806],
            [1153, -548],
            [379, -2554]
        ],
        [
            [874234, 354721],
            [-1429, -4889],
            [-270, 5406],
            [493, 2581],
            [581, 2427],
            [632, -2101],
            [-7, -3424]
        ],
        [
            [853469, 374507],
            [-1040, -2383],
            [-1919, 1318],
            [-541, 3089],
            [2810, 344],
            [690, -2368]
        ],
        [
            [862420, 377130],
            [1009, -5491],
            [-2345, 2960],
            [-2320, 600],
            [-1569, -474],
            [-1921, 253],
            [658, 3948],
            [3431, 298],
            [3057, -2094]
        ],
        [
            [891666, 380675],
            [47, -23402],
            [47, -23402]
        ],
        [
            [891760, 333871],
            [-2474, 5894],
            [-2821, 1444],
            [-684, -2046],
            [-3519, -221],
            [1179, 5844],
            [1749, 1994],
            [-724, 7809],
            [-1334, 6028],
            [-5385, 6081],
            [-2291, 600],
            [-4171, 6636],
            [-820, -3490],
            [-1066, -633],
            [-631, 2634],
            [-8, 3120],
            [-2123, 3527],
            [2992, 2586],
            [1981, -139],
            [-233, 1905],
            [-4066, 14],
            [-1100, 4276],
            [-2482, 1326],
            [-1176, 3553],
            [3745, 1739],
            [1424, 2341],
            [4459, -2949],
            [439, -2669],
            [775, -11614],
            [2875, -4298],
            [2322, 7617],
            [3187, 4334],
            [2469, 6],
            [2376, -2504],
            [2060, -2569],
            [2982, -1372]
        ],
        [
            [847889, 409542],
            [-2231, -7123],
            [-2088, -1381],
            [-2673, 1404],
            [-4629, -358],
            [-2427, -1034],
            [-395, -5435],
            [2486, -6386],
            [1500, 3253],
            [5180, 2443],
            [-228, -3307],
            [-1211, 1043],
            [-1206, -4207],
            [-2445, -2784],
            [2629, -9203],
            [-508, -2466],
            [2498, -8288],
            [-24, -4717],
            [-1483, -2111],
            [-1089, 2525],
            [1342, 5879],
            [-2726, -2780],
            [-691, 1988],
            [360, 2772],
            [-2003, 4211],
            [207, 6997],
            [-1853, -2182],
            [235, -8373],
            [113, -10274],
            [-1762, -1042],
            [-1193, 2108],
            [796, 6610],
            [-430, 6929],
            [-1168, 53],
            [-862, 4919],
            [1147, 4703],
            [396, 5702],
            [1396, 10824],
            [583, 2960],
            [2361, 5334],
            [2170, -2120],
            [3502, -997],
            [3194, 301],
            [2746, 5215],
            [484, -1605]
        ],
        [
            [857467, 407478],
            [-146, -6275],
            [-1432, 703],
            [-423, -4370],
            [1144, -3791],
            [-777, -861],
            [-1121, 4548],
            [-825, 9180],
            [558, 5737],
            [922, 2613],
            [199, -3921],
            [1640, -630],
            [261, -2933]
        ],
        [
            [804619, 413755],
            [464, -4799],
            [1900, -4058],
            [1792, 1461],
            [1773, -518],
            [1619, 3631],
            [1332, 630],
            [2628, -2012],
            [2265, 1530],
            [1424, 9987],
            [1070, 2498],
            [962, 8167],
            [3193, -4],
            [2408, -1210]
        ],
        [
            [827449, 429058],
            [-1580, -6485],
            [2042, -6799],
            [-480, -3303],
            [3115, -6646],
            [-3292, -847],
            [-926, -4896],
            [120, -6507],
            [-2671, -4911],
            [-73, -7152],
            [-1071, -10981],
            [-409, 2554],
            [-3156, -3231],
            [-1100, 4390],
            [-1981, 406],
            [-1385, 2301],
            [-3302, -2583],
            [-1014, 3475],
            [-1819, -394],
            [-2290, 828],
            [-425, 9631],
            [-1386, 1996],
            [-1334, 6143],
            [-387, 6282],
            [324, 6654],
            [1650, 4772]
        ],
        [
            [793937, 357321],
            [-3076, -150],
            [-2339, 6003],
            [-3567, 5867],
            [-1189, 4352],
            [-2103, 5848],
            [-1379, 5383],
            [-2113, 10052],
            [-2439, 5986],
            [-816, 6173],
            [-1024, 5606],
            [-2505, 4522],
            [-1452, 6144],
            [-2091, 4022],
            [-2898, 7912],
            [-244, 3656],
            [1789, -290],
            [4300, -1387],
            [2456, -7023],
            [2148, -4868],
            [1532, -2988],
            [2632, -7719],
            [2824, -113],
            [2334, -4919],
            [1607, -6012],
            [2115, -3281],
            [-1113, -5863],
            [1592, -2494],
            [998, -184],
            [471, -5009],
            [967, -4007],
            [2040, -635],
            [1351, -4545],
            [-697, -8931],
            [-111, -11108]
        ],
        [
            [725308, 616093],
            [-1762, -3257],
            [-1079, -6718],
            [2691, -2717],
            [2619, -3523],
            [3623, -4028],
            [3808, -931],
            [1602, -3653],
            [2146, -683],
            [3342, -1674],
            [2313, 120],
            [318, 2842],
            [-365, 4563],
            [214, 3093]
        ],
        [
            [770352, 602292],
            [210, -2722],
            [-974, -1318],
            [228, -4418],
            [-1985, 1298],
            [-3596, -4962],
            [84, -4109],
            [-1533, -6024],
            [-140, -3499],
            [-1239, -5920],
            [-2171, 1636],
            [-108, -7432],
            [-628, -2445],
            [294, -3050],
            [-1371, -1703]
        ],
        [
            [747310, 557728],
            [-398, -2622],
            [-1889, 90],
            [-3425, -1491],
            [160, -5402],
            [-1483, -4248],
            [-3997, -4834],
            [-3109, -8448],
            [-2089, -4530],
            [-2767, -4701],
            [-5, -3303],
            [-1385, -1769],
            [-2502, -2573],
            [-1297, -379],
            [-833, -5478],
            [578, -9339],
            [148, -5957],
            [-1177, -6822],
            [-13, -12200],
            [-1437, -348],
            [-1265, -5477],
            [846, -2367],
            [-2533, -2036],
            [-935, -4883],
            [-1115, -2064],
            [-2630, 6705],
            [-1286, 10056],
            [-1066, 7243],
            [-973, 3396],
            [-1476, 6899],
            [-689, 8981],
            [-480, 4485],
            [-2527, 9863],
            [-1151, 13916],
            [-830, 9189],
            [10, 8698],
            [-539, 6725],
            [-4043, -4298],
            [-1957, 861],
            [-3629, 8703],
            [1335, 2596],
            [-820, 2817],
            [-3258, 6096]
        ],
        [
            [689379, 569478],
            [1850, 4790],
            [6113, -18],
            [-552, 6165],
            [-1560, 3642],
            [-317, 5527],
            [-1818, 3225],
            [3061, 7527],
            [3226, -546],
            [2905, 7529],
            [1742, 7287],
            [2696, 7205],
            [-43, 5119],
            [2369, 4154],
            [-2242, 3546],
            [-964, 4858],
            [-985, 6293],
            [1362, 3096],
            [4214, -1752],
            [3096, 1067],
            [2682, 6036]
        ],
        [
            [482783, 786167],
            [458, -5130],
            [-2099, -6413],
            [-4925, -4242],
            [-3932, 1085],
            [2253, 7498],
            [-1451, 7302],
            [3779, 5623],
            [2100, 3355]
        ],
        [
            [635786, 674523],
            [879, -5295],
            [2634, -1496],
            [1929, -3603],
            [3949, -1238],
            [4338, 1900],
            [267, 1679]
        ],
        [
            [649782, 666470],
            [2440, 1390],
            [1976, 4105],
            [1858, -208],
            [1219, 1338],
            [1976, -662],
            [3071, -3640],
            [2218, -785],
            [3175, -6360],
            [2071, -257],
            [243, -6043]
        ],
        [
            [669094, 613549],
            [1376, -3777],
            [1118, -4337],
            [2655, -3157],
            [77, -6325],
            [1329, -1162],
            [230, -3307],
            [-4007, -3709],
            [-1047, -8343]
        ],
        [
            [670825, 579432],
            [-5225, 2168],
            [-3029, 1651],
            [-3135, 933],
            [-1185, 8805],
            [-1329, 1273],
            [-2135, -1284],
            [-2801, -3475],
            [-3395, 2382],
            [-2804, 5519],
            [-2674, 2045],
            [-1855, 6813],
            [-2050, 9574],
            [-1495, -1163],
            [-1765, 2379],
            [-1038, -2802]
        ],
        [
            [634910, 614250],
            [-1537, 3774],
            [-27, 3826],
            [-888, -2],
            [456, 5201],
            [-1429, 5457],
            [-3404, 3936],
            [-1924, 6826],
            [644, 5604],
            [1398, 2478],
            [-210, 4194],
            [-1821, 2156],
            [-1800, 8566]
        ],
        [
            [624368, 666266],
            [-1519, 5753],
            [543, 2224],
            [-867, 8235],
            [1902, 2046]
        ],
        [
            [634910, 614250],
            [-1648, 352]
        ],
        [
            [633262, 614602],
            [-1866, 598],
            [-2039, -6895]
        ],
        [
            [629357, 608305],
            [-5165, 574],
            [-7832, 14442],
            [-4138, 5026],
            [-3346, 1946]
        ],
        [
            [608876, 630293],
            [-1120, 8745]
        ],
        [
            [607756, 639038],
            [6149, 7473],
            [1050, 8681],
            [-262, 5246],
            [1520, 1774],
            [1424, 4481]
        ],
        [
            [617637, 666693],
            [1193, 1116],
            [3231, -927],
            [976, -1829],
            [1331, 1213]
        ],
        [
            [459698, 876564],
            [-642, -4647],
            [3139, -4898],
            [-3612, -5476],
            [-8012, -4922],
            [-2394, -1309],
            [-3657, 1057],
            [-7751, 2273],
            [2735, 3174],
            [-6046, 3511],
            [4918, 1392],
            [-119, 2109],
            [-5830, 1670],
            [1877, 4677],
            [4210, 1063],
            [4329, -4872],
            [4221, 3910],
            [3495, -2030],
            [4530, 3827],
            [4609, -509]
        ],
        [
            [599502, 638310],
            [43, -2939],
            [-377, -1092],
            [53, -49]
        ],
        [
            [599221, 634230],
            [-484, -2263]
        ],
        [
            [598737, 631967],
            [-1004, 994],
            [-582, -4782],
            [698, -806],
            [-709, -988],
            [-120, -1891],
            [1306, 974]
        ],
        [
            [598326, 625468],
            [65, -2793],
            [-1384, -11481]
        ],
        [
            [596731, 613060],
            [-1550, 10471]
        ],
        [
            [595181, 623532],
            [808, 2365],
            [-189, 408],
            [734, 3356],
            [564, 5418],
            [397, 1818],
            [77, 74]
        ],
        [
            [597572, 636971],
            [929, -13],
            [256, 1258],
            [745, 94]
        ],
        [
            [543112, 673883],
            [-1001, -5652],
            [416, -2225],
            [-583, -3693],
            [-2124, 2705],
            [-1413, 775],
            [-3877, 3651],
            [389, 3687],
            [3250, -657],
            [2834, 782],
            [2109, 627]
        ],
        [
            [525583, 695274],
            [1666, -5098],
            [-390, -9498],
            [-1263, 453],
            [-1133, -2398],
            [-1052, 1905],
            [-111, 8664],
            [-634, 4105],
            [1528, -359],
            [1389, 2226]
        ],
        [
            [538351, 733328],
            [-301, -3537],
            [665, -3057]
        ],
        [
            [538715, 726734],
            [-2211, 1046],
            [-2258, -2549],
            [153, -3564],
            [-340, -2046],
            [911, -3656],
            [2604, -3617],
            [1397, -5936],
            [3091, -5787],
            [2177, 44],
            [677, -1587],
            [-779, -1431],
            [2487, -2595],
            [2040, -2172],
            [2382, -3745],
            [287, -1341],
            [-519, -2572],
            [-1541, 3353],
            [-2414, 1182],
            [-1169, -4645],
            [2008, -2662],
            [-330, -3747],
            [-1160, -426],
            [-1484, -6159],
            [-1158, -554],
            [11, 2196],
            [567, 3852],
            [604, 1533],
            [-1085, 4162],
            [-848, 3621],
            [-1153, 895],
            [-820, 3099],
            [-1785, 1306],
            [-1202, 2886],
            [-2055, 465],
            [-2171, 3242],
            [-2541, 4674],
            [-1889, 4137],
            [-866, 7098],
            [-1382, 835],
            [-2260, 2370],
            [-1279, -970],
            [-1605, -3332],
            [-1154, -527]
        ],
        [
            [286381, 527658],
            [-843, -1200],
            [-1555, 1152],
            [-1588, 2616],
            [333, 1642],
            [1168, 500],
            [633, -242],
            [1869, -644],
            [1476, -1724],
            [460, -1967],
            [-1953, -133]
        ],
        [
            [608876, 630293],
            [-530, -1082],
            [-5563, -3604],
            [2769, -7180],
            [-919, -1220],
            [-457, -2405],
            [-2120, -994],
            [-664, -2585],
            [-1201, -2210],
            [-3091, 1142]
        ],
        [
            [597100, 610155],
            [-93, 1039]
        ],
        [
            [598326, 625468],
            [410, 2107],
            [1, 4392]
        ],
        [
            [599221, 634230],
            [3095, -2846],
            [5440, 7654]
        ],
        [
            [873995, 644571],
            [355, -2463],
            [-1564, -4345],
            [-1140, 2304],
            [-1424, -1669],
            [-737, -4201],
            [-1811, 2045],
            [23, 3406],
            [1537, 4284],
            [1579, -830],
            [1142, 3018],
            [2040, -1549]
        ],
        [
            [891600, 666062],
            [-1046, -5731],
            [484, -3598],
            [-1446, -5061],
            [-3550, -3379],
            [-4883, -440],
            [-3957, -8197],
            [-1867, 2759],
            [-115, 5368],
            [-4831, -1584],
            [-3288, -3382],
            [-3251, -138],
            [2816, -5284],
            [-1854, -12205],
            [-1795, -3021],
            [-1344, 2791],
            [681, 6471],
            [-1758, 2089],
            [-1129, 4924],
            [2626, 2213],
            [1457, 4514],
            [2794, 3712],
            [2038, 4909],
            [5529, 2142],
            [2970, -1469],
            [2907, 12767],
            [1852, -3429],
            [4075, 7181],
            [1580, 2790],
            [1745, 8781],
            [-476, 8075],
            [1173, 4536],
            [2954, 1318],
            [1514, -9959],
            [-82, -5822],
            [-2570, -7230],
            [47, -7411]
        ],
        [
            [899750, 716559],
            [1953, -1531],
            [1965, 3044],
            [618, -8062],
            [-4121, -1966],
            [-2433, -7131],
            [-4368, 4908],
            [-1511, -7857],
            [-3090, -108],
            [-382, 7139],
            [1374, 5526],
            [2968, 399],
            [809, 9933],
            [822, 5597],
            [3264, -7476],
            [2132, -2415]
        ],
        [
            [722944, 703460],
            [-1712, 1054],
            [-1393, 2580],
            [-4122, 752],
            [-4606, 196],
            [-1009, -791],
            [-3956, 3019],
            [-1576, -1487],
            [-432, -4239],
            [-4570, 2474],
            [-1829, -1014],
            [-622, -3146]
        ],
        [
            [697117, 702858],
            [-1593, -1327],
            [-3664, -5006],
            [-1215, -5138],
            [-1035, -46],
            [-761, 3401],
            [-3533, 234],
            [-565, 5882],
            [-1353, 50],
            [207, 7203],
            [-3326, 5245],
            [-4764, -560],
            [-3257, -1046],
            [-2652, 6473],
            [-2273, 2716],
            [-4306, 5141],
            [-519, 624],
            [-7151, -4244],
            [110, -26478]
        ],
        [
            [655467, 695982],
            [-1425, -350],
            [-1944, 5631],
            [-1878, 2011],
            [-3153, -1494],
            [-1227, -2389]
        ],
        [
            [645840, 699391],
            [-156, 1751],
            [682, 2992],
            [-529, 2502],
            [-3220, 2447],
            [-1253, 6449],
            [-1534, 1816],
            [-93, 2340],
            [2703, -682],
            [106, 5250],
            [2363, 1166],
            [2426, -1072],
            [500, 7006],
            [-495, 4440],
            [-2779, -347],
            [-2362, 1752],
            [-3216, -3157],
            [-2592, -1506]
        ],
        [
            [636391, 732538],
            [-1410, 1161],
            [282, 3696]
        ],
        [
            [635263, 737395],
            [-1771, 4798],
            [-2061, -201],
            [-2358, 4871],
            [1603, 5442],
            [-811, 1465],
            [2216, 7890],
            [2857, -4165],
            [346, 5245],
            [5734, 7810],
            [4339, 186],
            [6123, -4972],
            [3289, -2905],
            [2947, 3029],
            [4404, 145],
            [3552, -3722],
            [807, 2131],
            [3902, -309],
            [696, 3401],
            [-4501, 4938],
            [2666, 3498],
            [-520, 1957],
            [2666, 1867],
            [-2005, 4919],
            [1274, 2450],
            [10394, 2499],
            [1356, 1774],
            [6951, 2651],
            [2497, 2979],
            [4992, -1548],
            [875, -7442],
            [2900, 1747],
            [3568, -2449],
            [-230, -3919],
            [2664, 409],
            [6962, 6777],
            [-1017, -2252],
            [3544, -5547],
            [6207, -18238],
            [1481, 3760],
            [3826, -4137],
            [3992, 1845],
            [1533, -1292],
            [1337, -4149],
            [1942, -1394],
            [1183, -3048],
            [3578, 961],
            [1474, -4393]
        ],
        [
            [616264, 427488],
            [-2428, -8146],
            [33, -26159],
            [1645, -5924]
        ],
        [
            [615514, 387259],
            [-1946, -2867],
            [-686, -2996],
            [-1041, -527],
            [-394, -5059],
            [-892, -2898],
            [-542, -4778],
            [-1119, -2371]
        ],
        [
            [608894, 365763],
            [-3987, 7178],
            [-189, 4166],
            [-10072, 14629]
        ],
        [
            [594646, 391736],
            [176, 5318],
            [-672, 2722]
        ],
        [
            [594150, 399776],
            [-2, 359],
            [796, 2910],
            [1367, 4753],
            [1011, 5234],
            [-1222, 8243],
            [-325, 3604],
            [-1317, 4986]
        ],
        [
            [594458, 429865],
            [1709, 4288],
            [1882, 4732]
        ],
        [
            [704653, 682501],
            [-5252, -1090],
            [-3432, 2332],
            [-3012, -557],
            [263, 4140],
            [3024, -1202],
            [1017, 2216]
        ],
        [
            [697261, 688340],
            [2113, -708],
            [3557, 5172],
            [-3292, 3783],
            [-1979, -1790],
            [-2050, 2703],
            [2332, 4651],
            [-825, 707]
        ],
        [
            [798285, 501334],
            [644, -4789],
            [-343, -8606],
            [-4669, -5526],
            [1220, -4350],
            [-2916, -521],
            [-2404, -2892]
        ],
        [
            [789817, 474650],
            [-2325, 1048],
            [-1130, 3742],
            [-1405, 7418]
        ],
        [
            [784957, 486858],
            [-658, 8672],
            [1779, 5971],
            [3592, 1372],
            [2604, -1031]
        ],
        [
            [792274, 501842],
            [2292, -2816],
            [1256, 4951],
            [2463, -2643]
        ],
        [
            [850485, 670426],
            [173, 651],
            [1240, -256],
            [1083, 3241],
            [1963, 348],
            [1182, 473],
            [400, 1737]
        ],
        [
            [856526, 676620],
            [2398, -8473],
            [688, -4655],
            [21, -8272],
            [-1047, -3948],
            [-2515, -1379],
            [-2220, -2978],
            [-2503, -615],
            [-310, 3910],
            [515, 5386],
            [-1228, 7475],
            [2063, 1209],
            [-1903, 6146]
        ],
        [
            [559935, 702708],
            [-623, -276],
            [-1640, -1113],
            [-124, -1470],
            [-353, 60]
        ],
        [
            [555751, 705174],
            [519, 1609]
        ],
        [
            [556270, 706783],
            [665, 517],
            [384, 2384],
            [498, 397],
            [395, -1013],
            [519, -447],
            [363, -1142],
            [457, -338],
            [540, -1331],
            [395, 39],
            [-312, -1748],
            [-332, -854],
            [93, -539]
        ],
        [
            [633262, 614602],
            [580, -3170],
            [-248, -1638],
            [895, -5417]
        ],
        [
            [634489, 604377],
            [-1965, -186],
            [-692, 3421],
            [-2475, 693]
        ],
        [
            [792274, 501842],
            [904, 3236],
            [124, 6078],
            [-2249, 6259],
            [-173, 7087],
            [-2113, 5832],
            [-2101, 493],
            [-559, -2498],
            [-1627, -208],
            [-832, 1266],
            [-2928, -4284],
            [-65, 6437],
            [683, 7567],
            [-1877, 328],
            [-159, 4315],
            [-1203, 2216]
        ],
        [
            [778099, 545966],
            [592, 2645],
            [2364, 4671]
        ],
        [
            [783806, 560665],
            [1623, -5670],
            [1248, -6525],
            [3419, -56],
            [1077, -6262],
            [-1775, -1882],
            [-797, -2581],
            [3328, -4296],
            [2308, -8485],
            [1751, -6327],
            [2102, -4996],
            [700, -5072],
            [-505, -7179]
        ],
        [
            [597572, 636971],
            [989, 5849],
            [1382, 5060],
            [52, 250]
        ],
        [
            [599995, 648130],
            [1249, -366],
            [455, -2816],
            [-1515, -2706],
            [-682, -3932]
        ],
        [
            [478577, 430688],
            [-728, -63],
            [-2863, 3423],
            [-2524, 5466],
            [-2366, 3929],
            [-1871, 4633]
        ],
        [
            [468225, 448076],
            [664, 2297],
            [147, 2089],
            [1254, 3897],
            [1293, 3352]
        ],
        [
            [569444, 557328],
            [0, -14340],
            [-3195, -22],
            [-34, -3013]
        ],
        [
            [566215, 539953],
            [-11079, 13749],
            [-11079, 13749],
            [-2804, -3927]
        ],
        [
            [541253, 563524],
            [-1965, -2668],
            [-1562, 3943],
            [-4395, 3097]
        ],
        [
            [526339, 616984],
            [1355, 1664],
            [240, 3034],
            [-295, 2975],
            [1907, 2767],
            [856, 2301],
            [1354, 2061],
            [157, 5516]
        ],
        [
            [531913, 637302],
            [3262, -2472],
            [1167, 618],
            [2320, -1198],
            [3686, -3209],
            [1301, -6383],
            [2494, -1393],
            [3915, -3006],
            [2959, -3571],
            [1355, 1863],
            [1331, 3303],
            [-647, 5501],
            [871, 3493],
            [2002, 3365],
            [1912, 979],
            [3758, -1469],
            [947, -3211],
            [1034, -30],
            [885, -1225],
            [2760, -842],
            [677, -2372]
        ],
        [
            [725605, 443848],
            [-2416, -1643],
            [-1322, 5710],
            [-492, 10321],
            [1257, 11657],
            [1920, -3990],
            [1293, -5057],
            [1343, -7477],
            [-418, -7477],
            [-1165, -2044]
        ],
        [
            [578075, 179999],
            [-994, -714],
            [-2084, 5523],
            [1482, 4548],
            [1505, 2809],
            [1298, 1465],
            [1213, -2213],
            [963, -2167],
            [-852, -3492],
            [-472, -2343],
            [-1548, -1122],
            [-511, -2294]
        ],
        [
            [565233, 786490],
            [-667, 2212],
            [-1425, 768]
        ],
        [
            [563141, 789470],
            [-222, 1833],
            [296, 1966],
            [-1227, 1140],
            [-2910, 1258]
        ],
        [
            [559078, 795667],
            [-590, 6037]
        ],
        [
            [558488, 801704],
            [3181, 2202],
            [4659, -460],
            [2729, 709],
            [389, -1493],
            [1479, -461],
            [2670, -3485]
        ],
        [
            [575800, 812069],
            [1338, -1654],
            [237, -3482],
            [893, -4238]
        ],
        [
            [558488, 801704],
            [96, 5405],
            [1365, 4510],
            [2618, 2452],
            [2206, -5365],
            [2228, 140],
            [534, 5513]
        ],
        [
            [475928, 597946],
            [-422, 0],
            [63, -3847],
            [-1717, -231],
            [-895, -1634],
            [-1261, 0],
            [-1006, 932],
            [-2336, -771],
            [-905, -5596],
            [-868, -526],
            [-1306, -9053],
            [-3862, -7749],
            [-917, -9916],
            [-1138, -3226],
            [-333, -2588],
            [-6256, -573],
            [-48, 11]
        ],
        [
            [452721, 553179],
            [131, 3328],
            [1067, 1957],
            [909, 3742],
            [-180, 2430],
            [955, 5067],
            [1547, 4565],
            [935, 1158],
            [735, 4188],
            [66, 3826],
            [1003, 4438],
            [1850, 2618],
            [1761, 7333],
            [51, 101],
            [1396, 2758],
            [2583, 793],
            [2189, 4908],
            [1393, 1913],
            [2319, 5996],
            [-695, 8935],
            [1056, 6178],
            [372, 3781],
            [1787, 4851],
            [2787, 3281],
            [2060, 2969],
            [1856, 7435],
            [873, 4410],
            [2045, -35],
            [1675, -3048],
            [2641, 496],
            [2877, -1585],
            [1207, -77]
        ],
        [
            [578426, 725996],
            [-498, 3277],
            [294, 3066],
            [-89, 3152],
            [-1603, 4270],
            [-881, 3028],
            [-860, 2129],
            [-847, 700]
        ],
        [
            [573942, 745618],
            [662, 1059],
            [1847, 710],
            [2047, -2237],
            [1143, -269],
            [1255, -1932],
            [-200, -2433],
            [1012, -1175],
            [402, -3002],
            [970, -1826],
            [-197, -1070],
            [518, -728],
            [-735, -531],
            [-1637, 210],
            [-274, 994],
            [-581, -573],
            [197, -1286],
            [-761, -2289],
            [-485, -2464],
            [-699, -780]
        ],
        [
            [639045, 302003],
            [447, -8639],
            [720, -3359],
            [-276, -3443],
            [-491, -2113],
            [-944, 4208],
            [-522, -2125],
            [530, -5320],
            [-247, -3045],
            [-766, -1658],
            [-175, -6083],
            [-1094, -8371],
            [-1371, -9896],
            [-1716, -13605],
            [-1064, -9985],
            [-1255, -8327],
            [-2259, -1701],
            [-2425, -3037],
            [-1600, 1833],
            [-2205, 2569],
            [-767, 3789],
            [-183, 6367],
            [-978, 5724],
            [-254, 5167],
            [497, 5177],
            [1279, 1244],
            [8, 2390],
            [1327, 5444],
            [251, 4573],
            [-645, 3400],
            [-526, 4528],
            [-222, 6617],
            [971, 4018],
            [372, 4554],
            [1384, 265],
            [1550, 1472],
            [1028, 1299],
            [1220, 97],
            [1584, 4092],
            [2286, 4422],
            [833, 3613],
            [-378, 3069],
            [1180, -863],
            [1531, 4990],
            [51, 4318],
            [920, 3212],
            [969, -3083],
            [738, -3055],
            [687, -4743]
        ],
        [
            [230166, 585118],
            [-1078, -6304],
            [-485, -5169],
            [-203, -9621],
            [-268, -3506],
            [482, -3918],
            [861, -3502],
            [554, -5569],
            [1844, -5347],
            [649, -4097],
            [1086, -3535],
            [2950, -1905],
            [1148, -3004],
            [2436, 2006],
            [2119, 726],
            [2079, 1290],
            [1749, 1232],
            [1767, 2930],
            [662, 4189],
            [228, 6032],
            [480, 2100],
            [1881, 1880],
            [2938, 1666],
            [2459, -250],
            [1685, 608],
            [666, -1523],
            [-94, -3458],
            [-1493, -4269],
            [-660, -4372],
            [512, -1251],
            [-416, -3104],
            [-696, -5603],
            [-705, 1844],
            [-581, -120]
        ],
        [
            [243812, 503749],
            [-3144, 7731],
            [-1433, 2332],
            [-2268, 1873],
            [-1551, -522],
            [-2231, -2701],
            [-1400, -708],
            [-1962, 1892],
            [-2082, 1366],
            [-2596, 3295],
            [-2082, 1006],
            [-3145, 3338],
            [-2324, 3432],
            [-701, 1918],
            [-1555, 429],
            [-2841, 2273],
            [-1157, 3276],
            [-2985, 4076],
            [-1391, 4528],
            [-663, 3500],
            [927, 701],
            [-286, 2048],
            [639, 1862],
            [14, 2484],
            [-937, 3224],
            [-251, 2858],
            [-931, 3624],
            [-2448, 7138],
            [-2793, 5609],
            [-1352, 4477],
            [-2384, 2932],
            [-511, 1754],
            [424, 4438],
            [-1416, 1675],
            [-1640, 3490],
            [-692, 5010],
            [-1495, 584],
            [-1613, 3783],
            [-1301, 3493],
            [-121, 2244],
            [-1494, 5416],
            [-984, 5499],
            [42, 2758],
            [-2009, 2848],
            [-927, -313],
            [-1586, 1979],
            [-445, -2916],
            [460, -3446],
            [270, -5392],
            [953, -2961],
            [2061, -4946],
            [458, -1691],
            [422, -513],
            [367, -2466],
            [494, 100],
            [557, -4632],
            [844, -1827],
            [591, -2542],
            [1746, -3655],
            [922, -6680],
            [824, -3145],
            [772, -3365],
            [153, -3787],
            [1339, -238],
            [1114, -3262],
            [1008, -3207],
            [-68, -1286],
            [-1169, -2637],
            [-492, 34],
            [-732, 4365],
            [-1818, 4093],
            [-2003, 3472],
            [-1421, 1824],
            [92, 5254],
            [-422, 3892],
            [-1323, 2225],
            [-1910, 3205],
            [-367, -925],
            [-700, 1872],
            [-1714, 1738],
            [-1637, 4169],
            [203, 542],
            [1144, -407],
            [1030, 2682],
            [104, 3240],
            [-2138, 5122],
            [-1630, 1989],
            [-1025, 4484],
            [-1030, 4708],
            [-1287, 5740],
            [-1128, 6460]
        ],
        [
            [174645, 632982],
            [3157, 553],
            [3527, 779],
            [-260, -1405],
            [4195, -3491],
            [6337, -5058],
            [5524, 52],
            [2203, 2],
            [5, 2963],
            [4812, -3],
            [1013, -2546],
            [1421, -2270],
            [1650, -3158],
            [921, -3751],
            [692, -3947],
            [1436, -2169],
            [2305, -2154],
            [1750, 5673],
            [2271, 138],
            [1958, -2862],
            [1394, -4916],
            [960, -4209],
            [1639, -4093],
            [611, -5027],
            [778, -3375],
            [2167, -2226],
            [1972, -1579],
            [1083, 215]
        ],
        [
            [559935, 702708],
            [945, 419],
            [1288, 120]
        ],
        [
            [511853, 536900],
            [8, -16538],
            [-1519, -4797],
            [-236, -4424],
            [-2468, -1139],
            [-3790, -618],
            [-1027, -2552],
            [-1780, -282]
        ],
        [
            [468016, 488699],
            [128, 2237],
            [-237, 2777],
            [-1040, 2017],
            [-548, 4112],
            [-127, 4467]
        ],
        [
            [466192, 504309],
            [935, 1309],
            [467, 4231],
            [880, 165],
            [1940, -2000],
            [1567, 1420],
            [1073, -477],
            [417, 1597],
            [11146, 110],
            [618, 5027],
            [-481, 885],
            [-1341, 30992],
            [-1341, 30991],
            [4252, 129]
        ],
        [
            [778099, 545966],
            [-1591, -1660],
            [-1621, -3114],
            [-1961, -322],
            [-1266, -7763],
            [-1172, -1305],
            [1342, -6301],
            [1763, -5243],
            [1138, -4739],
            [-1017, -6243],
            [-959, -1327],
            [663, -3602],
            [1853, -5706],
            [317, -4008],
            [-43, -3336],
            [1086, -6549],
            [-1526, -6694],
            [-1346, -7379]
        ],
        [
            [773759, 470675],
            [-268, 5330],
            [854, 5501],
            [-934, 4249],
            [226, 7823],
            [-1128, 3720],
            [-905, 8594],
            [-502, 9072],
            [-1201, 5947],
            [-1830, -3601],
            [-3157, -5119],
            [-1558, 639],
            [-1721, 1684],
            [957, 8900],
            [-579, 6723],
            [-2178, 8280],
            [340, 2588],
            [-1625, 921],
            [-1971, 5857]
        ],
        [
            [554827, 705889],
            [-1204, -3537],
            [187, -2284]
        ],
        [
            [553810, 700068],
            [-581, 556],
            [-779, 2344],
            [-1201, 1426]
        ],
        [
            [553384, 711890],
            [737, -1232],
            [406, -995],
            [913, -774],
            [1059, -1490],
            [-229, -616]
        ],
        [
            [743753, 753348],
            [2928, 1244],
            [5301, 6185],
            [4225, 3378],
            [2415, -2204],
            [2898, -106],
            [1857, -3354],
            [2772, -258],
            [4016, -1806],
            [2700, 5001],
            [-1128, 4227],
            [2877, 7442],
            [3112, -2969],
            [2522, -841],
            [3266, -1845],
            [529, -5381],
            [3947, -3020],
            [2625, 1331],
            [3514, 938],
            [2784, -946],
            [2720, -3451],
            [1686, -3670],
            [2576, 74],
            [3499, -1169],
            [2553, 1780],
            [3657, 1189],
            [4069, 5061],
            [1665, -776],
            [1455, -2406],
            [3314, 598]
        ],
        [
            [591194, 207312],
            [-2107, 60]
        ],
        [
            [589087, 207372],
            [-238, 3174],
            [-411, 3220]
        ],
        [
            [588438, 213766],
            [-237, 2579],
            [494, 8006],
            [-722, 5101],
            [-1331, 10107]
        ],
        [
            [586642, 239559],
            [2927, 8151],
            [732, 5179],
            [420, 653],
            [314, 4228],
            [-447, 2127],
            [119, 5366],
            [542, 4977],
            [-6, 9088],
            [-1443, 2308],
            [-1323, 521],
            [-598, 1777],
            [-1288, 1516],
            [-2317, -143],
            [-179, 2679]
        ],
        [
            [584095, 287986],
            [-264, 5110],
            [8430, 5919]
        ],
        [
            [592261, 299015],
            [1599, -3447],
            [764, 660],
            [1097, -1817],
            [161, -2877],
            [-585, -3339],
            [206, -5062],
            [1813, -4436],
            [847, 4983],
            [1203, 1512],
            [-236, 9233],
            [-1164, 5193],
            [-1002, 2316],
            [-161, -18]
        ],
        [
            [596803, 301916],
            [-432, 8226],
            [664, 6767]
        ],
        [
            [597035, 316909],
            [1054, 293],
            [3338, -2023],
            [726, 908],
            [1933, 185],
            [990, 2154],
            [1667, -118]
        ],
        [
            [606743, 318308],
            [3037, 2789],
            [2210, 4163]
        ],
        [
            [611990, 325260],
            [449, -3220],
            [-114, -7154],
            [343, -6301],
            [108, -11222],
            [489, -3518],
            [-829, -5131],
            [-1078, -4987],
            [-1768, -4453],
            [-2540, -2729],
            [-3131, -3486],
            [-3138, -7707],
            [-1069, -1311],
            [-1939, -5103],
            [-1145, -1660],
            [-234, -5120],
            [1317, -5438],
            [548, -4212],
            [34, -2148],
            [491, 359],
            [-79, -7043],
            [-451, -3336],
            [655, -1229],
            [-413, -2988],
            [-1161, -2555],
            [-2292, -2427],
            [-3340, -3886],
            [-1219, -2655],
            [239, -3026],
            [710, -483],
            [-239, -3779]
        ],
        [
            [466192, 504309],
            [-1833, 4933],
            [-1681, 5283],
            [-1844, 1902],
            [-1327, 2111],
            [-1551, -79],
            [-1356, -1565],
            [-1380, 620],
            [-951, -2302]
        ],
        [
            [454269, 515212],
            [-241, 3869],
            [776, 3541],
            [345, 6761],
            [-307, 7096],
            [-336, 3570],
            [277, 3581],
            [-718, 3414],
            [-1464, 3101]
        ],
        [
            [452601, 550145],
            [606, 2395],
            [10878, -45],
            [-526, 10371],
            [679, 3688],
            [2603, 645],
            [-90, 18374],
            [9117, -376],
            [8, 10877]
        ],
        [
            [592261, 299015],
            [-1461, 1860],
            [843, 6671],
            [874, 2500],
            [-533, 5950],
            [558, 5821],
            [473, 1946],
            [-706, 6095],
            [-1311, 3204]
        ],
        [
            [590998, 333062],
            [2723, -1340],
            [553, -1965]
        ],
        [
            [594274, 329757],
            [-90, -796],
            [982, -4638],
            [174, -8656],
            [-806, -3990],
            [826, -5285],
            [-25, -3122],
            [640, -2102],
            [-12, -2697],
            [443, -1540],
            [486, 1796],
            [986, -2796],
            [66, 889],
            [-567, 3839],
            [-523, 300],
            [-51, 957]
        ],
        [
            [783725, 444024],
            [639, -671],
            [1640, -4335],
            [1165, -4808],
            [160, -4836],
            [-296, -3266],
            [270, -2469],
            [203, -4250],
            [978, -1979],
            [1093, -6350],
            [-53, -2428],
            [-1970, -479],
            [-2628, 5319],
            [-3286, 5700],
            [-325, 3658],
            [-1606, 4803],
            [-384, 5947],
            [-1002, 3915],
            [305, 5229],
            [-613, 3044]
        ],
        [
            [778015, 445768],
            [483, 1280],
            [2267, -3145],
            [218, -3687],
            [1834, 858],
            [908, 2950]
        ],
        [
            [804619, 413755],
            [2036, -2461],
            [2147, 1342],
            [559, 6080],
            [1185, 1354],
            [3330, 1555],
            [1992, 5681],
            [1365, 4541]
        ],
        [
            [820696, 438466],
            [2139, 4994],
            [1401, 5613],
            [1123, 24],
            [1427, -3633],
            [127, -3122],
            [1830, -2002],
            [2317, -2160],
            [-198, -2813],
            [-1864, -356],
            [497, -3507],
            [-2046, -2446]
        ],
        [
            [564486, 273514],
            [2274, 1632],
            [1802, -414],
            [1096, -1618],
            [20, -596]
        ],
        [
            [555265, 221490],
            [-2, -26522],
            [-2480, -3672],
            [-1492, -524],
            [-1747, 1358],
            [-1246, 523],
            [-468, 3071],
            [-1097, 1966],
            [-1331, -3552]
        ],
        [
            [545402, 194138],
            [-2064, 5425],
            [-1087, 5244],
            [-613, 6992],
            [-685, 5202],
            [-931, 11058],
            [-62, 8591],
            [-356, 3917],
            [-1081, 2959],
            [-1433, 5933],
            [-1460, 8615],
            [-607, 4509],
            [-2260, 7010],
            [-169, 5509]
        ],
        [
            [964221, 240216],
            [-1055, -1723],
            [-1529, 1941],
            [-1987, 3232],
            [-1790, 3804],
            [-1839, 5064],
            [-384, 2435],
            [1195, -104],
            [1556, -2441],
            [1222, -2442],
            [889, -2010],
            [2278, -4453],
            [1444, -3303]
        ],
        [
            [541253, 563524],
            [682, -11162],
            [1040, -1867],
            [44, -2284],
            [1156, -2462],
            [-604, -3091],
            [-1070, -14572],
            [-147, -9339],
            [-3543, -6772],
            [-1199, -9459],
            [1156, -2660],
            [-6, -4619],
            [1781, -165],
            [-277, -3383]
        ],
        [
            [539392, 488991],
            [-517, -159],
            [-1879, 7862],
            [-652, 286],
            [-2172, -4014],
            [-2151, 2095],
            [-1495, 419],
            [-801, -1008],
            [-1629, 218],
            [-1638, -3060],
            [-1417, -176],
            [-3362, 3712],
            [-1316, -1763],
            [-1418, 122],
            [-1042, 2713],
            [-2784, 2679],
            [-2985, -850],
            [-724, -1553],
            [-390, -4130],
            [-797, -2896],
            [-192, -6410]
        ],
        [
            [523611, 433614],
            [-2883, -2584],
            [-1055, 377],
            [-1068, -1609],
            [-2222, 157],
            [-1487, 4492],
            [-914, 5198],
            [-1967, 4731],
            [-2087, -89],
            [-2452, 4]
        ],
        [
            [269035, 507031],
            [-239, -689],
            [-141, -1603],
            [283, -2628],
            [-640, -2446],
            [-298, -2889],
            [-90, -3165],
            [149, -1851],
            [70, -3233],
            [-424, -705],
            [-260, -3071],
            [191, -1897],
            [-568, -1836],
            [129, -1941],
            [426, -1180]
        ],
        [
            [261909, 478972],
            [-961, 2262],
            [-1298, 2897],
            [-611, 2421],
            [-1171, 2257],
            [-1392, 3243],
            [309, 1111],
            [458, -1081],
            [210, 507]
        ],
        [
            [511241, 767495],
            [-2033, 563],
            [0, 1]
        ],
        [
            [509208, 768059],
            [1431, 1973],
            [2433, 10565],
            [3800, 3006],
            [2308, -203]
        ],
        [
            [586391, 898841],
            [0, -1],
            [-4726, -2880]
        ],
        [
            [581665, 895960],
            [-2244, -662]
        ],
        [
            [557348, 895596],
            [-1723, -295],
            [-407, -4725],
            [-5236, 1150],
            [-735, -3998],
            [-2667, 24],
            [-1834, -5109],
            [-2779, -7961],
            [-4313, -10102],
            [1012, -2453],
            [-967, -2846],
            [-2755, 123],
            [-1804, -6735],
            [171, -9536],
            [1775, -3640],
            [-919, -8442],
            [-2311, -4923],
            [-1225, -4138]
        ],
        [
            [530631, 821990],
            [-1863, 4407],
            [-5485, -8305],
            [-3704, -1683],
            [-3841, 3657],
            [-993, 7720],
            [-879, 16572],
            [2558, 4621],
            [7335, 6028],
            [5484, 7411],
            [5085, 10008],
            [6675, 13866],
            [4652, 5404],
            [7633, 9007],
            [6096, 3143],
            [4570, -381],
            [4230, 5949],
            [5066, -318],
            [4987, 1431],
            [8689, -5255],
            [-3578, -1921],
            [3043, -4510]
        ],
        [
            [568678, 958412],
            [-6205, -2936],
            [-4901, 1666],
            [1917, 1853],
            [-1679, 2295],
            [5757, 1438],
            [1103, -2695],
            [4008, -1621]
        ],
        [
            [550699, 971682],
            [9144, -5355],
            [-6990, -2825],
            [-1543, -5285],
            [-2437, -1355],
            [-1323, -5950],
            [-3347, -280],
            [-5974, 4380],
            [2519, 2551],
            [-4164, 2078],
            [-5411, 6063],
            [-2161, 5623],
            [7573, 2572],
            [1521, -2514],
            [3957, 100],
            [1055, 2454],
            [4078, 250],
            [3503, -2507]
        ],
        [
            [570687, 976749],
            [5444, -2520],
            [-4119, -3868],
            [-8056, -846],
            [-8192, 1198],
            [-494, 1978],
            [-3986, 126],
            [-3040, 3296],
            [8578, 2006],
            [4033, -1727],
            [2809, 2150],
            [7023, -1793]
        ],
        [
            [980611, 105508],
            [630, -2965],
            [1976, 2910],
            [803, -3033],
            [3, -3022],
            [-1034, -3326],
            [-1816, -5292],
            [-1421, -2888],
            [1025, -3455],
            [-2143, -88],
            [-2377, -2706],
            [-744, -4701],
            [-1579, -7266],
            [-2181, -3209],
            [-1386, -2049],
            [-2559, 152],
            [-1799, 2368],
            [-3019, 505],
            [-466, 2637],
            [1493, 5326],
            [3492, 7088],
            [1794, 1351],
            [1996, 2732],
            [2380, 3761],
            [1667, 3726],
            [1236, 5352],
            [1052, 1817],
            [413, 4009],
            [1948, 3319],
            [616, -3053]
        ],
        [
            [985032, 139709],
            [2013, -7560],
            [58, 4904],
            [1254, -1958],
            [416, -5432],
            [2235, -2340],
            [1877, -575],
            [1587, 2739],
            [1408, -830],
            [-673, -6372],
            [-846, -4191],
            [-2120, 148],
            [-742, -2183],
            [258, -3089],
            [-408, -1336],
            [-1050, -3869],
            [-1377, -4918],
            [-2146, -2863],
            [-477, 1885],
            [-1158, 1034],
            [1601, 5907],
            [-909, 3952],
            [-2989, 2873],
            [78, 2601],
            [2007, 2506],
            [469, 5528],
            [-129, 4644],
            [-1125, 4811],
            [74, 1266],
            [-1327, 2965],
            [-2186, 6354],
            [-1162, 5084],
            [1031, 564],
            [1512, -3990],
            [2161, -1862],
            [785, -6397]
        ],
        [
            [647523, 518917],
            [-906, 5017],
            [-2173, 11851]
        ],
        [
            [644444, 535785],
            [8333, 7181],
            [1852, 14362],
            [-1273, 5086]
        ],
        [
            [656657, 578330],
            [1246, -4905],
            [1550, -2607],
            [2038, -939],
            [1645, -1308],
            [1254, -4117],
            [748, -2385],
            [995, -910],
            [-5, -1601],
            [-1011, -4280],
            [-444, -2016],
            [-1170, -2296],
            [-1037, -4920],
            [-1260, 377],
            [-578, -1712],
            [-446, -3641],
            [342, -4800],
            [-262, -882],
            [-1279, 23],
            [-1735, -2683],
            [-270, -3499],
            [-636, -1515],
            [-1727, 58],
            [-1088, -1809],
            [14, -2900],
            [-1344, -1994],
            [-1533, 677],
            [-1858, -2422],
            [-1283, -407]
        ],
        [
            [655752, 586450],
            [809, 2445],
            [343, -624],
            [-262, -2966],
            [-362, -1303]
        ],
        [
            [689379, 569478],
            [-2036, 1815],
            [-829, 5162],
            [-2146, 5468],
            [-5118, -1350],
            [-4513, -134],
            [-3912, -1007]
        ],
        [
            [283662, 451220],
            [-926, 2072],
            [-595, 3876],
            [686, 1918],
            [-704, 492],
            [-518, 2373],
            [-1384, 1996],
            [-1215, -457],
            [-563, -2498],
            [-1122, -1804],
            [-606, -251],
            [-273, -1494],
            [1325, -3898],
            [-758, -918],
            [-401, -1064],
            [-1293, -366],
            [-481, 4290],
            [-361, -1221],
            [-916, 421],
            [-561, 2890],
            [-1139, 477],
            [-721, 840],
            [-1192, -11],
            [-86, -1559],
            [-319, 1086]
        ],
        [
            [270705, 468041],
            [997, -2576],
            [-57, -1522],
            [1109, -322],
            [262, 584],
            [763, -1765],
            [1367, 519],
            [1182, 1814],
            [1687, 1448],
            [948, 2146],
            [1533, -421],
            [-103, -707],
            [1549, -245],
            [1236, -1240],
            [906, -2161],
            [1045, -1984]
        ],
        [
            [304520, 267590],
            [-2785, 4123],
            [-241, 2947],
            [-5507, 7210],
            [-4981, 7854],
            [-2143, 4426],
            [-1151, 5933],
            [456, 2069],
            [-2352, 9424],
            [-2739, 13249],
            [-2624, 14298],
            [-1136, 3272],
            [-874, 5289],
            [-2159, 4687],
            [-1979, 2907],
            [899, 3205],
            [-1346, 6849],
            [865, 5029],
            [2214, 4535]
        ],
        [
            [851046, 459772],
            [282, -4771],
            [164, -4028],
            [-946, -6571],
            [-1015, 7320],
            [-1299, -3642],
            [887, -5291],
            [-796, -3366],
            [-3269, 4168],
            [-781, 5197],
            [847, 3415],
            [-1759, 3396],
            [-873, -2978],
            [-1307, 277],
            [-2055, -4007],
            [-460, 2102],
            [1090, 6052],
            [1750, 2020],
            [1515, 2706],
            [981, -3251],
            [2112, 1966],
            [454, 3205],
            [1963, 191],
            [-165, 5553],
            [2252, -3406],
            [233, -3616],
            [195, -2641]
        ],
        [
            [844395, 473158],
            [-998, -2360],
            [-870, -4537],
            [-873, -2127],
            [-1710, 4964],
            [572, 1922],
            [697, 2011],
            [307, 4458],
            [1532, 422],
            [-448, -4835],
            [2056, 6932],
            [-265, -6850]
        ],
        [
            [829179, 466247],
            [-3696, -6814],
            [1362, 5022],
            [2007, 4435],
            [1668, 4968],
            [1456, 7134],
            [494, -5856],
            [-1833, -3954],
            [-1458, -4935]
        ],
        [
            [838565, 484741],
            [1667, -2223],
            [1768, 10],
            [-54, -2999],
            [-1287, -3050],
            [-1764, -2156],
            [-98, 3337],
            [198, 3663],
            [-430, 3418]
        ],
        [
            [848617, 486686],
            [781, -8018],
            [-2144, 1906],
            [58, -2411],
            [680, -4431],
            [-1321, -1609],
            [-116, 5051],
            [-836, 373],
            [-435, 4347],
            [1635, -573],
            [-37, 2719],
            [-1697, 5483],
            [2667, -158],
            [765, -2679]
        ],
        [
            [837575, 493199],
            [-736, -6205],
            [-1190, 3583],
            [-1418, 5471],
            [2380, -263],
            [964, -2586]
        ],
        [
            [837003, 532223],
            [1712, -2050],
            [856, 1870],
            [253, -1824],
            [-452, -2978],
            [948, -5147],
            [-731, -5968],
            [-1638, -2379],
            [-438, -5790],
            [622, -5719],
            [1472, -791],
            [1229, 850],
            [3470, -3982],
            [-265, -3909],
            [906, -1725],
            [-288, -3309],
            [-2165, 3525],
            [-1026, 3772],
            [-715, -2636],
            [-1769, 4299],
            [-2523, -1061],
            [-1382, 1587],
            [141, 2968],
            [868, 1827],
            [-830, 1661],
            [-358, -2588],
            [-1372, 4126],
            [-415, 3127],
            [-103, 6875],
            [1118, -2363],
            [288, 11234],
            [905, 6507],
            [1682, -9]
        ],
        [
            [932999, 350372],
            [-778, -718],
            [-1203, 2758],
            [-1216, 4561],
            [-597, 5470],
            [384, 694],
            [299, -2137],
            [841, -1628],
            [1347, -4552],
            [1312, -2437],
            [-389, -2011]
        ],
        [
            [922174, 360009],
            [-1455, -591],
            [-438, -2014],
            [-1520, -1745],
            [-1425, -1680],
            [-1476, 9],
            [-2277, 2086],
            [-1587, 2002],
            [230, 2222],
            [2491, -1048],
            [1520, 562],
            [418, 3442],
            [399, 178],
            [270, -3812],
            [1585, 548],
            [784, 2457],
            [1550, 2561],
            [-305, 4232],
            [1663, 136],
            [561, -1179],
            [-55, -3983],
            [-933, -4383]
        ],
        [
            [891666, 380675],
            [4820, -4948],
            [5135, -4109],
            [1915, -3679],
            [1546, -3610],
            [422, -4231],
            [4629, -4438],
            [675, -3809],
            [-2556, -773],
            [613, -4785],
            [2480, -4711],
            [1804, -7616],
            [1591, 239],
            [-111, -3181],
            [2144, -1220],
            [-833, -1355],
            [2952, -3021],
            [-308, -2076],
            [-1839, -501],
            [-684, 1862],
            [-2387, 807],
            [-2805, 1080],
            [-2160, 4582],
            [-1577, 3948],
            [-1443, 6285],
            [-3623, 3140],
            [-2353, -2048],
            [-1696, -2371],
            [354, -5297],
            [-2182, -2468],
            [-1556, 1201],
            [-2873, 299]
        ],
        [
            [925388, 367032],
            [-869, -1913],
            [-524, 4239],
            [-646, 2774],
            [-1258, 2354],
            [-1580, 3063],
            [-2006, 2111],
            [772, 1734],
            [1500, -2011],
            [944, -1579],
            [1167, -1724],
            [1111, -3016],
            [1056, -2298],
            [333, -3734]
        ],
        [
            [554612, 790178],
            [3421, -815],
            [5108, 107]
        ],
        [
            [565352, 769729],
            [1397, -6269],
            [-297, -2014],
            [-1379, -836],
            [-2522, -5973],
            [716, -3227],
            [-606, 419]
        ],
        [
            [562661, 751829],
            [-2640, 2760],
            [-1999, -1014],
            [-1312, 737],
            [-1641, -1539],
            [-1401, 2545],
            [-1142, -975],
            [-157, 434]
        ],
        [
            [539221, 785374],
            [1898, 2109],
            [4335, 3320],
            [3498, 2430],
            [2772, -1213],
            [209, -1751],
            [2679, -91]
        ],
        [
            [317802, 530241],
            [-711, -1810],
            [-2091, 42],
            [-1623, -253],
            [-162, 3073],
            [394, 1049],
            [2273, -42],
            [1420, -632],
            [500, -1427]
        ],
        [
            [862888, 703783],
            [389, -1256]
        ],
        [
            [863277, 702527],
            [-1056, 431],
            [-1205, -2432],
            [-830, -2444],
            [105, -5157],
            [-1436, -1588],
            [-494, -1266],
            [-1047, -2123],
            [-1850, -1181],
            [-1205, -1928],
            [-87, -3109],
            [-324, -793],
            [1105, -1168],
            [1573, -3149]
        ],
        [
            [850485, 670426],
            [-1349, 1366],
            [-336, -1349],
            [-814, -596],
            [-98, 1351],
            [-719, 658],
            [-747, 1145],
            [760, 3161],
            [656, 843],
            [-248, 1312],
            [705, 3873],
            [-182, 1173],
            [-1621, 783],
            [-1311, 1925]
        ],
        [
            [479295, 665744],
            [-1117, -1863],
            [-1464, 1009],
            [-1434, -790],
            [425, 5619],
            [-261, 4416],
            [-1243, 662],
            [-664, 2721],
            [221, 4701],
            [1107, 2607],
            [197, 2903],
            [580, 4318],
            [-62, 3043],
            [-555, 2578],
            [-122, 2421]
        ],
        [
            [642748, 576195],
            [-770, -510],
            [-839, 1424]
        ],
        [
            [641139, 577109],
            [-184, 5226],
            [748, 3767],
            [759, 772],
            [840, -2251],
            [49, -4204],
            [-603, -4224]
        ],
        [
            [578426, 725996],
            [1239, -1323],
            [1306, 1155],
            [1260, -1232]
        ],
        [
            [582231, 724596],
            [64, -1852],
            [-1347, -1545],
            [-843, 672],
            [-778, -8663]
        ],
        [
            [562936, 716996],
            [-509, 1251],
            [644, 1212],
            [-685, 895],
            [-872, -1610],
            [-1620, 2087],
            [-218, 2960],
            [-1692, 1689],
            [-312, 2285],
            [-1505, 2821]
        ],
        [
            [563084, 743187],
            [1199, 1537],
            [1719, -795],
            [1781, -26],
            [1290, -1755],
            [948, 1102],
            [2050, 690],
            [699, 1679],
            [1172, -1]
        ],
        [
            [899021, 763763],
            [2795, -12719],
            [-4112, 2371],
            [-1709, -10376],
            [2708, -7360],
            [-78, -5018],
            [-2105, 4329],
            [-1821, -5558],
            [-514, 6026],
            [310, 6996],
            [-317, 7748],
            [643, 5429],
            [123, 9602],
            [-1628, 7060],
            [246, 9813],
            [2567, 3304],
            [-1103, 3328],
            [1236, 1008],
            [722, -4749],
            [962, -6921],
            [-71, -7067],
            [1146, -7246]
        ],
        [
            [554612, 790178],
            [633, 3160],
            [3833, 2329]
        ],
        [
            [13849, 877486],
            [1874, -1786],
            [-645, 5218],
            [7541, -1071],
            [5438, -6720],
            [-2754, -3130],
            [-4554, -743],
            [-68, -7017],
            [-1112, -1494],
            [-2602, 214],
            [-2117, 2504],
            [-3693, 2094],
            [-621, 3115],
            [-2821, 1175],
            [-3159, -932],
            [-1510, 2513],
            [604, 2669],
            [-3327, -1706],
            [1253, -3378],
            [-1576, -3048],
            [0, 28609],
            [6806, -5484],
            [7282, -7139],
            [-239, -4463]
        ],
        [
            [999999, 907990],
            [-3046, -367],
            [-495, 2281],
            [3541, 2994],
            [0, -4908]
        ],
        [
            [3628, 908427],
            [-3628, -437],
            [0, 4908],
            [356, 301],
            [2354, -15],
            [4018, -2054],
            [-238, -982],
            [-2862, -1721]
        ],
        [
            [898899, 925082],
            [-4212, -50],
            [-5693, 801],
            [-486, 379],
            [2635, 2839],
            [3473, 664],
            [3947, -2746],
            [336, -1887]
        ],
        [
            [918698, 938522],
            [-3210, -2837],
            [-4440, 642],
            [-5162, 2834],
            [664, 2325],
            [5178, -1084],
            [6970, -1880]
        ],
        [
            [903017, 941959],
            [-2185, -5333],
            [-10239, 199],
            [-4607, -1696],
            [-5502, 4669],
            [1492, 4937],
            [3665, 1347],
            [7335, -315],
            [10041, -3808]
        ],
        [
            [659821, 907187],
            [-1641, -629],
            [-9077, 932],
            [-737, 3189],
            [-5028, 1925],
            [-406, 3879],
            [2840, 1540],
            [-94, 3916],
            [5509, 6124],
            [-2554, 878],
            [6651, 6303],
            [-752, 3259],
            [6214, 3792],
            [9170, 4613],
            [9245, 1344],
            [4758, 2663],
            [5405, 933],
            [1931, -2836],
            [-1865, -2235],
            [-9843, -3561],
            [-8482, -3424],
            [-8629, -6835],
            [-4140, -7009],
            [-4354, -6906],
            [565, -5965],
            [5314, -5890]
        ],
        [
            [862888, 703784],
            [-17, 3647]
        ],
        [
            [871581, 730510],
            [952, 7868],
            [1079, 2628],
            [1460, 6461]
        ],
        [
            [833838, 770197],
            [-2507, -7616],
            [25, -3160]
        ],
        [
            [635263, 737395],
            [-282, -3695],
            [1410, -1162]
        ],
        [
            [636391, 732538],
            [-1265, -4258],
            [-2694, -1184],
            [-2760, -7413],
            [2524, -6815],
            [-273, -4837],
            [3033, -8457]
        ],
        [
            [623715, 706060],
            [-1684, -1128],
            [-487, 1335]
        ],
        [
            [610986, 711252],
            [-3542, 6067],
            [-3169, 2709],
            [-2399, 4219],
            [2021, 1148],
            [2305, 6005],
            [-1553, 2842],
            [4094, 2931],
            [-74, 1570],
            [-2493, -1157]
        ],
        [
            [606176, 737586],
            [88, 3189],
            [1431, 2005],
            [2688, 527],
            [438, 2395],
            [-614, 3959],
            [1128, 3760],
            [-33, 2109],
            [-4094, 2337],
            [-1624, -78],
            [-1714, 3363],
            [-2131, -1137],
            [-3528, 2524],
            [60, 1413],
            [-988, 3114],
            [-2215, 348],
            [-230, 2229],
            [694, 1454],
            [-1775, 4066],
            [-2880, -694],
            [-844, 361],
            [-702, -1634],
            [-1037, 291]
        ],
        [
            [577725, 826437],
            [3157, 3969],
            [-2910, 3414]
        ],
        [
            [581665, 895960],
            [4726, 2881]
        ],
        [
            [586391, 898841],
            [2866, 2497],
            [4563, -4341],
            [7607, -1709],
            [10496, -8122],
            [2132, -3412],
            [183, -4780],
            [-3084, -3773],
            [-4535, -1914],
            [-12401, 5458],
            [-2040, -913],
            [4529, -5259],
            [177, -3332],
            [182, -7337],
            [3576, -2190],
            [2171, -1864],
            [359, 3482],
            [-1674, 3086],
            [1768, 2719],
            [6715, -4469],
            [2339, 1750],
            [-1869, 5259],
            [6474, 7033],
            [2563, -414],
            [2594, -2510],
            [1618, 4935],
            [-2316, 4281],
            [1360, 4295],
            [-2042, 4454],
            [7770, -2304],
            [1587, -4021],
            [-3517, -887],
            [19, -3996],
            [2186, -2459],
            [4292, 1558],
            [679, 4580],
            [5803, 3420],
            [9693, 6167],
            [2096, -354],
            [-2739, -4357],
            [3446, -749],
            [1990, 2453],
            [5206, 198],
            [4125, 2977],
            [3165, -4326],
            [3157, 4756],
            [-2911, 4160],
            [1445, 2370],
            [8205, -2173],
            [3845, -2245],
            [10067, -8204],
            [1857, 3758],
            [-2823, 3797],
            [-81, 1523],
            [-3348, 704],
            [916, 3405],
            [-1486, 5602],
            [-84, 2299],
            [5126, 6502],
            [1823, 6527],
            [2066, 1412],
            [7354, -1894],
            [579, -3994],
            [-2633, -5824],
            [1728, -2290],
            [894, -5019],
            [-631, -9840],
            [3064, -4402],
            [-1192, -4793],
            [-5441, -10200],
            [3175, -1058],
            [1105, 2585],
            [3056, 1844],
            [738, 3553],
            [2404, 3420],
            [-1619, 4082],
            [1296, 4741],
            [-3037, 591],
            [-668, 3994],
            [2216, 7210],
            [-3607, 5856],
            [4971, 4840],
            [-643, 5106],
            [1386, 163],
            [1459, -3981],
            [-1096, -6930],
            [2973, -1311],
            [-1267, 5178],
            [4649, 2823],
            [5765, 380],
            [5133, -4093],
            [-2470, 5980],
            [-277, 7650],
            [4830, 1450],
            [6682, -317],
            [6019, 940],
            [-2257, 3755],
            [3214, 4716],
            [3192, 197],
            [5400, 3562],
            [7335, 958],
            [927, 1967],
            [7294, 666],
            [2273, -1612],
            [6234, 3816],
            [5103, -120],
            [766, 3100],
            [2654, 3056],
            [6558, 2947],
            [4764, -2327],
            [-3783, -1770],
            [6292, -1100],
            [750, -3549],
            [2538, 1748],
            [8121, -96],
            [6262, -3502],
            [2230, -2690],
            [-692, -3734],
            [-3072, -2125],
            [-7300, -3986],
            [-2087, -2131],
            [3445, -1005],
            [4108, -1812],
            [2501, 1359],
            [1417, -4609],
            [1220, 1866],
            [4442, 1134],
            [8912, -1186],
            [677, -3359],
            [11613, -1068],
            [159, 5485],
            [5895, -1257],
            [4434, 39],
            [4486, -3782],
            [1279, -4596],
            [-1644, -3007],
            [3489, -5651],
            [4369, -2916],
            [2680, 7535],
            [4456, -3230],
            [4734, 1930],
            [5377, -2209],
            [2046, 2014],
            [4543, -1007],
            [-2005, 6666],
            [3667, 3111],
            [25089, -4663],
            [2364, -4262],
            [7272, -5488],
            [11216, 1358],
            [5531, -1182],
            [2312, -2969],
            [-338, -5252],
            [3422, -2044],
            [3718, 1470],
            [4926, 188],
            [5245, -1409],
            [5264, 795],
            [4839, -6383],
            [3442, 2297],
            [-2246, 4589],
            [1237, 3191],
            [8862, -2008],
            [5778, 429],
            [7989, -3427],
            [3889, -3133],
            [0, -28609],
            [-20, -38],
            [-3571, -3156],
            [-3600, 527],
            [2505, -3823],
            [1653, -5917],
            [1284, -1934],
            [322, -2970],
            [-717, -1902],
            [-5177, 1564],
            [-7764, -5406],
            [-2470, -836],
            [-4251, -5046],
            [-4031, -4408],
            [-1022, -3263],
            [-3973, 4968],
            [-7237, -5637],
            [-1264, 2667],
            [-2676, -3076],
            [-3715, 984],
            [-895, -4722],
            [-3333, -6950],
            [99, -2902],
            [3164, -1609],
            [-372, -10454],
            [-2579, -266],
            [-1189, -6007],
            [1155, -3092],
            [-4857, -3668],
            [-964, -8199],
            [-4141, -1751],
            [-833, -7296],
            [-4004, -6690],
            [-1027, 4947],
            [-1189, 10477],
            [-1551, 15957],
            [1336, 9959],
            [2343, 4285],
            [145, 3356],
            [4317, 1607],
            [4962, 9041],
            [4782, 7383],
            [4993, 5730],
            [2233, 10123],
            [-3375, -606],
            [-1668, -5915],
            [-7046, -7887],
            [-2275, 8831],
            [-7172, -2438],
            [-6951, -12037],
            [2293, -4404],
            [-6200, -1875],
            [-4294, -739],
            [201, 5192],
            [-4318, 1090],
            [-3441, -3528],
            [-8494, 1235],
            [-9137, -2129],
            [-8998, -14016],
            [-10645, -16936],
            [4376, -905],
            [1366, -4497],
            [2698, -1597],
            [1778, 3587],
            [3046, -465],
            [4011, -7900],
            [94, -6110],
            [-2172, -7174],
            [-234, -8575],
            [-1253, -11482],
            [-4187, -10391],
            [-930, -4967],
            [-3771, -8362],
            [-3741, -8290],
            [-1795, -4243],
            [-3701, -4213],
            [-1752, -93],
            [-1745, 3490],
            [-3728, -5255],
            [-433, -2389]
        ],
        [
            [791876, 961665],
            [-15660, -2771],
            [5075, 9429],
            [2281, 807],
            [2088, -468],
            [7040, -4078],
            [-824, -2919]
        ],
        [
            [642044, 977753],
            [-3729, -946],
            [-2498, -545],
            [-387, -1179],
            [-3247, -1186],
            [-3009, 1702],
            [1582, 2242],
            [-6182, 218],
            [5423, 1308],
            [4220, 86],
            [568, -1934],
            [1595, 1719],
            [2619, 1184],
            [4120, -1574],
            [-1075, -1095]
        ],
        [
            [777610, 965788],
            [-6061, -896],
            [-7737, 2072],
            [-4610, 2741],
            [-2132, 5151],
            [-3790, 1419],
            [7213, 4906],
            [6009, 1622],
            [5397, -3616],
            [6396, -6942],
            [-685, -6457]
        ],
        [
            [584497, 391199],
            [1103, -4052],
            [-161, -4225],
            [-802, -909]
        ],
        [
            [582165, 389715],
            [672, -733],
            [1660, 2217]
        ],
        [
            [452601, 550145],
            [120, 3034]
        ],
        [
            [634489, 604377],
            [1087, -6192],
            [1367, -1641],
            [476, -2522],
            [1893, -3018],
            [168, -2963],
            [-277, -2392],
            [352, -2412],
            [798, -2012],
            [370, -2355],
            [416, -1761]
        ],
        [
            [642748, 576195],
            [528, -2743]
        ],
        [
            [644444, 535785],
            [-8009, -2753],
            [-2593, -3231],
            [-1991, -7540],
            [-1296, -1197],
            [-695, 2393],
            [-1064, -359],
            [-2686, 718],
            [-509, 719],
            [-3205, -165],
            [-754, -649],
            [-1140, 1867],
            [-737, -3530],
            [285, -3027],
            [-1219, -2291]
        ],
        [
            [618831, 516740],
            [-361, 3064],
            [-837, 2163],
            [-214, 2865],
            [-1435, 2573],
            [-1481, 6022],
            [-783, 5851],
            [-1922, 4942],
            [-1238, 1179],
            [-1840, 6844],
            [-321, 4990],
            [118, 4257],
            [-1593, 7962],
            [-1303, 2803],
            [-1500, 1485],
            [-914, 4114],
            [152, 1624],
            [-772, 3722],
            [-811, 1604],
            [-1085, 5342],
            [-1691, 5790],
            [-1417, 4932],
            [-1383, -34],
            [432, 3941],
            [124, 2514],
            [344, 2866]
        ],
        [
            [594342, 467309],
            [-384, 142],
            [47, 3575],
            [-333, 2466],
            [-1431, 2835],
            [-334, 5178],
            [334, 5301],
            [-1288, 493],
            [-190, -1603],
            [-1669, -370],
            [667, -2095],
            [239, -4315],
            [-1526, -3945],
            [-1383, -5178],
            [-1431, -739],
            [-2337, 4191],
            [-1049, -1479],
            [-286, -2096],
            [-1430, -1356],
            [-96, -1479],
            [-2766, 0],
            [-381, 1479],
            [-2003, 247],
            [-1001, -1233],
            [-763, 616],
            [-1431, 4192],
            [-477, 1972],
            [-2003, -986],
            [-763, -3329],
            [-715, -6410],
            [-954, -1356],
            [-853, -783]
        ],
        [
            [563511, 479360],
            [33, 1739],
            [-1020, 2117],
            [-31, 4171],
            [-582, 2770],
            [-976, -415],
            [280, 2637],
            [719, 2994],
            [-314, 2974],
            [913, 2202],
            [-579, 1678],
            [734, 4434],
            [1269, 5288],
            [2395, -502],
            [-137, 28506]
        ],
        [
            [602406, 557328],
            [895, -7046],
            [-609, -1303],
            [404, -7392],
            [1019, -8573],
            [1059, -1769],
            [1520, -2653]
        ],
        [
            [602368, 521111],
            [-274, -4773],
            [-1197, -10552]
        ],
        [
            [594458, 429865],
            [-1709, -3303],
            [-1954, 17],
            [-2236, -1681],
            [-1766, 1606],
            [-1144, -1958]
        ],
        [
            [453673, 488282],
            [-455, 5504]
        ],
        [
            [453573, 496971],
            [-1146, 5591],
            [-1386, 2557],
            [1222, 1364],
            [1346, 5041],
            [660, 3688]
        ],
        [
            [950330, 324070],
            [776, -2467],
            [-1940, 45],
            [-1056, 4419],
            [1660, -1738],
            [560, -259]
        ],
        [
            [946811, 328449],
            [-1083, -160],
            [-1703, 727],
            [-581, 1106],
            [174, 2851],
            [1834, -1130],
            [904, -1507],
            [455, -1887]
        ],
        [
            [949110, 330409],
            [-418, -1323],
            [-2059, 6224],
            [-578, 4291],
            [944, 0],
            [1000, -5745],
            [1111, -3447]
        ],
        [
            [944096, 339476],
            [118, -1443],
            [-2177, 3046],
            [-1521, 2580],
            [-1042, 2391],
            [414, 732],
            [1278, -1724],
            [2278, -3303],
            [652, -2279]
        ],
        [
            [937606, 346582],
            [-553, -409],
            [-1215, 1637],
            [-1141, 2950],
            [143, 1197],
            [1659, -3033],
            [1107, -2342]
        ],
        [
            [468225, 448076],
            [-748, 533],
            [-2000, 2892],
            [-1447, 3847],
            [-486, 2623],
            [-340, 5308]
        ],
        [
            [256130, 495460],
            [-308, -1691],
            [-1609, 107],
            [-1000, 688],
            [-1149, 1428],
            [-1543, 446],
            [-787, 1541]
        ],
        [
            [635967, 481286],
            [-18, -118],
            [-9, -2958],
            [-1, -7244],
            [0, -3747],
            [-1254, -4410],
            [-1937, -5993]
        ],
        [
            [619847, 481655],
            [904, -1324],
            [545, -2969],
            [1253, -3007],
            [1379, -23],
            [2618, 1837],
            [3024, 851],
            [2445, 2231],
            [1378, 472],
            [992, 1310],
            [1582, 253]
        ],
        [
            [635967, 481286],
            [887, 141],
            [1280, 1067],
            [1473, 723],
            [1315, 2458],
            [1053, 20],
            [63, -1986],
            [-257, -4176],
            [11, -3775],
            [-587, -2593],
            [-782, -7763],
            [-1338, -8021],
            [-1717, -9171],
            [-2384, -10524],
            [-2371, -8040],
            [-3267, -9796],
            [-2780, -5813],
            [-4155, -7130],
            [-2589, -5462],
            [-3040, -8699],
            [-641, -3787],
            [-627, -1700]
        ],
        [
            [348890, 429597],
            [1090, -4255],
            [-485, -3090],
            [-245, -3284],
            [-708, -3020]
        ],
        [
            [341257, 442239],
            [3328, -1438],
            [299, 1295],
            [2246, 518],
            [2986, -1930]
        ],
        [
            [562661, 751829],
            [-770, -1869],
            [-543, -2895]
        ],
        [
            [538097, 726083],
            [618, 651]
        ],
        [
            [566398, 873340],
            [-4779, -2034],
            [-2693, -5010],
            [434, -4398],
            [-4419, -5774],
            [-5364, -6176],
            [-2023, -10113],
            [1977, -5060],
            [2657, -3983],
            [-2552, -8101],
            [-2889, -1680],
            [-1059, -12054],
            [-1578, -6728],
            [-3370, 694],
            [-1572, -5695],
            [-3216, -331],
            [-883, 6788],
            [-2325, 8149],
            [-2113, 10156]
        ],
        [
            [589087, 207372],
            [-565, -3189],
            [-1626, -775],
            [-1658, 3892],
            [-26, 2483],
            [759, 2696],
            [262, 2091],
            [803, 512],
            [1402, -1316]
        ],
        [
            [599995, 648130],
            [-259, 5494],
            [679, 2956]
        ],
        [
            [600415, 656580],
            [744, 1573],
            [744, 1573],
            [151, 4006],
            [909, -1397],
            [3058, 1998],
            [1478, -1352],
            [2285, 22],
            [3197, 2695],
            [1496, -122],
            [3160, 1117]
        ],
        [
            [505181, 443453],
            [-2237, -1532]
        ],
        [
            [784957, 486858],
            [-2493, 3297],
            [-2376, -134],
            [407, 5642],
            [-2446, -42],
            [-220, -7898],
            [-1499, -10489],
            [-904, -6343],
            [191, -5198],
            [1810, -225],
            [1127, -6554],
            [499, -6216],
            [1550, -4113],
            [1683, -834],
            [1439, -3727]
        ],
        [
            [778015, 445768],
            [-1097, 2755],
            [-475, 3557],
            [-1476, 4053],
            [-1346, 3406],
            [-456, -4220],
            [-527, 3989],
            [303, 4480],
            [818, 6887]
        ],
        [
            [688416, 666083],
            [1561, 7268],
            [-600, 5346],
            [-2038, 1713],
            [720, 3162],
            [2319, -337],
            [1320, 3969],
            [883, 4607],
            [3714, 1669],
            [-579, -3330],
            [398, -1996],
            [1147, 186]
        ],
        [
            [649782, 666470],
            [-517, 5079],
            [404, 7511],
            [-2167, 2431],
            [713, 4916],
            [-1843, 419],
            [614, 6053],
            [2619, -1763],
            [2441, 2298],
            [-2024, 4310],
            [-796, 4108],
            [-2236, -1832],
            [-283, -5262],
            [-867, 4653]
        ],
        [
            [655467, 695982],
            [3133, 98],
            [-456, 3618],
            [2373, 2474],
            [2341, 4172],
            [3743, -3795],
            [297, -5730],
            [1062, -1471],
            [3004, 331],
            [932, -1304],
            [1365, -7403],
            [3177, -4959],
            [1812, -3382],
            [2905, -3516],
            [3695, -3074],
            [-77, -4394]
        ],
        [
            [847134, 335488],
            [327, 1694],
            [2391, 1614],
            [1938, 243],
            [868, 897],
            [1052, -890],
            [-1022, -1946],
            [-2895, -3143],
            [-2326, -2063]
        ],
        [
            [330736, 471946],
            [-2320, -790],
            [-500, 646],
            [806, 1975],
            [-56, 2837],
            [1598, 933],
            [583, -251],
            [-111, -5350]
        ],
        [
            [523391, 664657],
            [3025, 2898],
            [1945, -861],
            [-82, -3634],
            [2356, 2643],
            [198, -1379],
            [-1389, -3519],
            [-19, -3321],
            [962, -1784],
            [-366, -6215],
            [-1828, -3611],
            [528, -3913],
            [1436, -122],
            [699, -3414],
            [1057, -1123]
        ],
        [
            [600415, 656580],
            [-1021, 3256],
            [1052, 2697],
            [-1694, -611],
            [-2323, 1652],
            [-1910, -4133],
            [-4216, -807],
            [-2249, 3854],
            [-2995, 241],
            [-640, -2979],
            [-1920, -852],
            [-2686, 3823],
            [-3033, -129],
            [-1645, 7142],
            [-2029, 3984],
            [1351, 5584],
            [-1761, 3431],
            [3081, 6868],
            [4278, 287],
            [1167, 5458],
            [5294, -951],
            [3339, 4658],
            [3237, 2030],
            [4595, 153],
            [4849, -5062],
            [3985, -2777],
            [3236, 1107],
            [2391, -640],
            [3279, 3748]
        ],
        [
            [577768, 701000],
            [330, -2761],
            [2425, -2319],
            [-506, -1759],
            [-3298, -396],
            [-1185, -2221],
            [-2318, -3868],
            [-874, 3345],
            [38, 1482]
        ],
        [
            [836598, 563007],
            [-1190, -5891],
            [-1464, 6063],
            [-317, 5324],
            [1635, 7053],
            [2223, 5436],
            [1268, -2139],
            [-482, -4332],
            [-1673, -11514]
        ],
        [
            [588517, 391969],
            [-84, -4323],
            [-522, -5026],
            [773, -2766],
            [1241, 1612],
            [1607, 428],
            [347, -838],
            [1585, 1768],
            [-1099, 2462],
            [911, 3246],
            [1370, 3204]
        ],
        [
            [608894, 365763],
            [-1282, -8848],
            [165, -4070],
            [1778, -2616],
            [83, -1867],
            [-764, -4337],
            [159, -2182],
            [-182, -3431],
            [970, -4501],
            [1150, -7081],
            [1019, -1570]
        ],
        [
            [611990, 325260],
            [-2210, -4164],
            [-3037, -2788]
        ],
        [
            [597035, 316909],
            [12, 119],
            [-915, 2750],
            [-232, 7542],
            [-1468, 3840],
            [-158, -1403]
        ],
        [
            [590998, 333062],
            [-1577, 2156],
            [-1765, 1209],
            [-1107, 1202],
            [-141, 221]
        ],
        [
            [586408, 337850],
            [-1397, 7338],
            [-211, 4447],
            [-2239, 4873],
            [636, 2751],
            [-535, 2830],
            [93, 3059],
            [-533, 1038],
            [132, 3101]
        ],
        [
            [585397, 377557],
            [-599, 1628],
            [-161, 2828]
        ],
        [
            [584497, 391199],
            [974, 862],
            [3046, -92]
        ],
        [
            [594150, 399776],
            [-122, 491],
            [-1440, 1413],
            [-1183, -1710],
            [-1759, -1027],
            [-1271, -4195],
            [142, -2779]
        ],
        [
            [606176, 737586],
            [-2218, -575],
            [-1848, -2323],
            [-2600, -379],
            [-2393, -2676],
            [162, -4467],
            [1359, -1732],
            [2834, 431],
            [-543, -2562],
            [-3041, -1244],
            [-3771, -4154],
            [-1544, 1460],
            [612, 3374],
            [-3035, 2102],
            [491, 1377],
            [2659, 2387],
            [-805, 1645],
            [-4317, 1814],
            [-192, 2678],
            [-2573, -884],
            [-1031, -3955],
            [-2151, -5307]
        ],
        [
            [351739, 156857],
            [-1202, -4513],
            [-3137, -3991],
            [-2051, 1436],
            [-1503, -770],
            [-2568, 3084],
            [-1884, -231],
            [-1692, 3972]
        ],
        [
            [67939, 536384],
            [-406, -1201],
            [-690, 1028],
            [79, 2007],
            [-459, 2615],
            [138, 799],
            [482, 1171],
            [-192, 1412],
            [161, 670],
            [212, -133],
            [1063, -1214],
            [494, -622],
            [450, -962],
            [708, -2516],
            [-66, -398],
            [-1086, -1534],
            [-888, -1122]
        ],
        [
            [66446, 547590],
            [-931, -514],
            [-478, 1512],
            [-319, 584],
            [-25, 449],
            [272, 615],
            [987, -682],
            [727, -1102],
            [-233, -862]
        ],
        [
            [64560, 551417],
            [-86, -777],
            [-1489, 209],
            [209, 874],
            [1366, -306]
        ],
        [
            [62075, 552460],
            [-150, -415],
            [-199, 93],
            [-967, 252],
            [-353, 1629],
            [-108, 286],
            [743, 990],
            [232, -461],
            [802, -2374]
        ],
        [
            [57375, 557198],
            [-330, -711],
            [-935, 1310],
            [143, 523],
            [424, 704],
            [640, -153],
            [58, -1673]
        ],
        [
            [251111, 744104],
            [-2833, -2369],
            [-1973, -2873],
            [-1885, -3027],
            [-9, -1054],
            [2783, 1496],
            [1703, -2467],
            [2144, 1827],
            [2229, 2326],
            [2452, 2378],
            [-892, -3787],
            [1575, -916],
            [1956, -2736],
            [2465, 1599],
            [2729, 627],
            [584, -2010],
            [847, -291]
        ],
        [
            [265731, 732606],
            [1382, -2862],
            [-2447, -648],
            [-93, 32],
            [-2184, 758],
            [-2167, -1436],
            [-1889, -646],
            [-1657, -4641],
            [-1088, -2588],
            [376, -850],
            [2041, 4627],
            [418, 25],
            [-1441, -5525],
            [-627, -5005],
            [-528, -4064],
            [348, -3516],
            [-74, -1773],
            [22, -1866],
            [748, -3774],
            [256, -487],
            [944, 39],
            [750, 790],
            [562, 993],
            [1128, 3499],
            [76, 4737],
            [-921, 4442],
            [139, 3047],
            [724, 3522],
            [693, 2412],
            [1111, 1719],
            [258, -2409],
            [491, 3545],
            [612, 731],
            [389, 2729],
            [2361, -1437],
            [2056, -2800],
            [225, -3262],
            [-253, -3273],
            [-1528, -2872],
            [143, -1807],
            [552, -60],
            [1722, 3159],
            [1028, -718],
            [500, -4164],
            [139, -2945]
        ],
        [
            [269111, 701521],
            [-952, -2772],
            [1713, -1485],
            [1385, -368],
            [2011, 955],
            [1645, 1986],
            [1430, 969],
            [2095, 2077],
            [2393, 4288],
            [-54, 705]
        ],
        [
            [280531, 710035],
            [1316, 822],
            [2183, -267],
            [2275, -595],
            [2084, 2370],
            [-165, 2794],
            [-284, 1005]
        ],
        [
            [313507, 723477],
            [480, -2354],
            [-2967, -3479],
            [-2854, -2479],
            [-2933, -2125],
            [-1471, -4264],
            [-470, -1615],
            [-28, -3808],
            [916, -3806],
            [1153, -180],
            [-292, 2621],
            [834, -1595],
            [-223, -2052],
            [-1875, -1164],
            [-1334, 140],
            [-2054, -1253],
            [-1209, -359],
            [-1615, -355],
            [-2315, -2079],
            [4080, 1353],
            [822, -1361],
            [-3888, -2154],
            [-1770, -14],
            [83, 881],
            [-846, -1991],
            [817, -329],
            [-599, -5159],
            [-2022, -5527],
            [-206, 1844],
            [-610, 374],
            [-911, 1796],
            [577, -3867],
            [690, -1278],
            [42, -2714],
            [-891, -2791],
            [-1563, -5734],
            [-253, 285],
            [859, 4886],
            [-1419, 2744],
            [-326, 5966],
            [-535, -3105],
            [593, -4555],
            [-1835, 1125],
            [1912, -2312],
            [119, -6833],
            [797, -497],
            [288, -2484],
            [391, -7185],
            [-1766, -5330],
            [-2874, -2129],
            [-1826, -4212],
            [-1387, -461],
            [-1406, -2638],
            [-397, -2409],
            [-3050, -4661],
            [-1565, -3419],
            [-1309, -4257],
            [-429, -5102],
            [491, -4987],
            [927, -6143],
            [1235, -5083],
            [15, -3103],
            [1315, -8330],
            [-87, -4842],
            [-121, -2793],
            [-693, -4385],
            [-830, -906],
            [-1367, 871],
            [-439, 3150],
            [-1055, 1652],
            [-1473, 6176],
            [-1292, 5493],
            [-417, 2810],
            [570, 4766],
            [-777, 3949],
            [-2166, 6008],
            [-1084, 1102],
            [-2803, -3259],
            [-497, 358],
            [-1348, 3350],
            [-1741, 1777],
            [-3140, -903],
            [-2465, 794],
            [-2119, -495],
            [-1148, -1120],
            [500, -1908],
            [-45, -2913],
            [590, -1418],
            [-529, -944],
            [-1031, 1059],
            [-1043, -1362],
            [-2015, 223],
            [-2074, 3795],
            [-2423, -896],
            [-2020, 1662],
            [-1728, -503],
            [-2338, -1678],
            [-2529, -5324],
            [-2760, -3096],
            [-1517, -3428],
            [-638, -3232],
            [-28, -4955],
            [139, -3447],
            [527, -2441]
        ],
        [
            [174645, 632982],
            [-467, 3668],
            [-1800, 4129],
            [-1297, 860],
            [-303, 2060],
            [-1559, 360],
            [-994, 1943],
            [-2580, 708],
            [-709, 1159],
            [-337, 3938],
            [-2695, 7214],
            [-2314, 9983],
            [99, 1664],
            [-1226, 2372],
            [-2150, 6017],
            [-383, 5855],
            [-1480, 3922],
            [609, 5952],
            [-97, 6158],
            [-887, 5503],
            [1086, 6768],
            [337, 6517],
            [338, 6516],
            [-502, 9632],
            [-878, 6143],
            [-810, 3334],
            [337, 1402],
            [4017, -2439],
            [1479, -6779],
            [688, 1896],
            [-445, 5888],
            [-944, 5889]
        ],
        [
            [74982, 809493],
            [-2774, -2737],
            [-1420, 1853],
            [-430, 3364],
            [2523, 2552],
            [1484, 1094],
            [1844, -485],
            [1177, -2228],
            [-2404, -3413]
        ],
        [
            [40058, 829558],
            [-1705, -1117],
            [-1821, 1342],
            [-1686, 1951],
            [2743, 1229],
            [2204, -650],
            [265, -2755]
        ],
        [
            [22968, 857366],
            [1714, -1366],
            [1732, 738],
            [2246, -1895],
            [2758, -960],
            [-229, -782],
            [-2104, -1520],
            [-2114, 1562],
            [-1058, 1303],
            [-2449, -417],
            [-662, 632],
            [166, 2705]
        ],
        [
            [127025, 822026],
            [2543, -3237],
            [1736, -5152]
        ],
        [
            [137400, 792883],
            [-1527, 2701],
            [-2449, 2290],
            [-785, 6263],
            [-3581, 5809],
            [-1497, 6780],
            [-2667, 464],
            [-4417, 176],
            [-3255, 2067],
            [-5744, 7452],
            [-2659, 1363],
            [-4859, 2563],
            [-3846, -613],
            [-5463, 3299],
            [-3302, 3060],
            [-3083, -1520],
            [573, -4988],
            [-1536, -461],
            [-3214, -1497],
            [-2445, -2424],
            [-3079, -1525],
            [-397, 4231],
            [1249, 7043],
            [2953, 2210],
            [-762, 1802],
            [-3541, -4002],
            [-1896, -4779],
            [-4002, -5108],
            [2032, -3487],
            [-2625, -5159],
            [-2986, -3005],
            [-2780, -2191],
            [-688, -3179],
            [-4337, -3708],
            [-878, -3372],
            [-3250, -3069],
            [-1906, 552],
            [-2593, -2002],
            [-2819, -2446],
            [-2310, -2402],
            [-4767, -2050],
            [-435, 1207],
            [3039, 3355],
            [2717, 2216],
            [2961, 3927],
            [3446, 812],
            [1370, 2944],
            [3850, 4299],
            [620, 1438],
            [2051, 2535],
            [479, 5446],
            [1413, 4241],
            [-3203, -2177],
            [-896, 1235],
            [-1504, -2611],
            [-1814, 3643],
            [-749, -2577],
            [-1038, 3580],
            [-2777, -2874],
            [-1706, 5],
            [-239, 4275],
            [502, 2633],
            [-1788, 2557],
            [-3612, -1376],
            [-2344, 3371],
            [-1901, 1724],
            [-12, 4067],
            [-2140, 3060],
            [1074, 4129],
            [2265, 4007],
            [991, 3686],
            [2248, 525],
            [1905, -1149],
            [2241, 3465],
            [2017, -619],
            [2117, 2228],
            [-517, 3280],
            [-1554, 1292],
            [2056, 2771],
            [-1706, -82],
            [-2948, -1564],
            [-846, -1585],
            [-2191, 1583],
            [-3929, -805],
            [-4068, 1721],
            [-1165, 2888],
            [-3516, 4173],
            [3904, 3004],
            [6196, 3507],
            [2284, 0],
            [-378, -3587],
            [5863, 280],
            [-2255, 4448],
            [-3417, 2735],
            [-1976, 3590],
            [-2665, 3062],
            [-3817, 2270],
            [1555, 3764],
            [4928, 233],
            [3506, 3272],
            [661, 3497],
            [2838, 3412],
            [2706, 822],
            [5265, 3188],
            [2554, -481],
            [4275, 3828],
            [4203, -1508],
            [2010, -3241],
            [1234, 1390],
            [4694, -431],
            [-166, -1652],
            [4250, -1220],
            [2833, 718],
            [5852, -2269],
            [5342, -675],
            [2139, -934],
            [3696, 1167],
            [4214, -2158],
            [3018, -1005]
        ],
        [
            [301856, 483912],
            [-79, -1697],
            [-1630, -838],
            [906, -3259],
            [-34, -3756],
            [-1225, -4171],
            [1051, -5697],
            [1198, 466],
            [623, 5191],
            [-861, 2527],
            [-140, 5436],
            [3459, 2919],
            [-385, 3385],
            [974, 2266],
            [997, -5047],
            [1948, -116],
            [1805, -4004],
            [109, -2378],
            [2494, -63],
            [2967, 738],
            [1591, -3216],
            [2124, -887],
            [1559, 2243],
            [32, 1808],
            [3440, 433],
            [3329, 100],
            [-2359, -2121],
            [949, -3390],
            [2222, -539],
            [2106, -3531],
            [442, -5754],
            [1448, 163],
            [1088, -1693]
        ],
        [
            [800139, 554113],
            [-3709, -6143],
            [-2315, -6785],
            [-610, -4983],
            [2124, -7569],
            [2598, -9383],
            [2521, -4436],
            [1688, -5766],
            [1272, -13290],
            [-375, -12632],
            [-2317, -4729],
            [-3181, -4624],
            [-2266, -5986],
            [-3464, -6686],
            [-1008, 4605],
            [781, 4865],
            [-2061, 4079]
        ],
        [
            [966235, 281102],
            [-916, -944],
            [-931, 3144],
            [102, 1926],
            [1745, -4126]
        ],
        [
            [964187, 292107],
            [451, -5789],
            [-747, 901],
            [-578, -390],
            [-398, 1983],
            [-57, 5502],
            [1329, -2207]
        ],
        [
            [647523, 518917],
            [-2009, -1929],
            [-538, -3188],
            [-65, -2449],
            [-2766, -3032],
            [-4438, -3349],
            [-2488, -5067],
            [-1223, -396],
            [-833, 425],
            [-1623, -2980],
            [-1771, -1383],
            [-2332, -373],
            [-701, -408],
            [-608, -1896],
            [-728, -524],
            [-430, -1826],
            [-1375, 158],
            [-887, -974],
            [-1923, 365],
            [-722, 4195],
            [79, 3925],
            [-454, 2119],
            [-543, 5311],
            [-799, 2952],
            [556, 349],
            [-285, 3281],
            [337, 1385],
            [-123, 3132]
        ],
        [
            [591194, 207312],
            [-694, -5228],
            [-328, -5966],
            [-719, -3241],
            [-1895, -3627],
            [-543, -1038],
            [-1177, -3648],
            [-775, -3690],
            [-1575, -5145],
            [-3140, -7409],
            [-1960, -4308],
            [-2098, -3267],
            [-2903, -2786],
            [-1416, -374],
            [-359, -1994],
            [-1688, 1062],
            [-1375, -1367],
            [-3011, 1384],
            [-1682, -876],
            [-1151, 376],
            [-2864, -2835],
            [-2372, -1137],
            [-1716, -2714],
            [-1264, -173],
            [-1175, 2561],
            [-939, 131],
            [-1196, 3206],
            [-131, -996],
            [-369, 1930],
            [15, 4211],
            [-902, 4812],
            [896, 1308],
            [-73, 5511],
            [-1819, 6721],
            [-1395, 6083],
            [-5, 19],
            [-1994, 9330]
        ],
        [
            [581755, 240710],
            [1131, -79],
            [1344, -1216],
            [936, 862],
            [1476, -718]
        ],
        [
            [584095, 287986],
            [-2104, -983],
            [-1582, -2861],
            [-338, -2490],
            [-994, -564],
            [-2416, -5906],
            [-1538, -4648],
            [-938, -166],
            [-902, 827],
            [-3105, 786]
        ],
        [
            [584782, 339862],
            [-159, -1541],
            [949, -575],
            [600, -1495],
            [464, 406],
            [-228, 1193]
        ]
    ],
    "bbox": [-180, -55.61183, 180, 83.64513],
    "transform": {
        "scale": [0.00036000036000036, 0.00013925709925709926],
        "translate": [-180, -55.61183]
    }
};