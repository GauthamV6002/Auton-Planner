const canvas = new fabric.Canvas('c');

const C_HEIGHT = 598, C_WIDTH = 594;
const PT_RADIUS = 20;

const RAD2DEG = 57.2957795131;

const autonMovePoints = [];
const originalCoords = [];

const scaleInchesToCoords = (dist) => dist * (550 / 144.0);
const scaleCoordsToInches = (dist) => dist / (550 / 144.0); 

class autonMovePoint {  

    constructor(index, xPos, yPos) {
        this.index = index;

        this.fabricCircleElement = new fabric.Circle({
            radius: PT_RADIUS,
            fill: '#eef',
            originX: 'center',
            originY: 'center',
            strokeWidth: 2, // Border width
            stroke: 'black', // Border color
            opacity: 0.35
        });

        this.fabricTextElement = new fabric.Text(String(autonMovePoints.length), { 
            fontSize: 20,
            originX: 'center',
            originY: 'center',
        });

        this.fabricGroup = new fabric.Group([ this.fabricCircleElement, this.fabricTextElement ], {
            left: xPos,
            top: C_HEIGHT - yPos,
        });

        this.fabricGroup.lockScalingX = true;
        this.fabricGroup.lockScalingY = true;
        this.fabricGroup.lockRotation = true;
          
        canvas.add(this.fabricGroup);

        // Edges Management

        this.forwardEdge = undefined;
        this.backwardEdge = undefined;

        if(autonMovePoints.length) {
            const edge = new autonPathEdge(autonMovePoints[index-1].getPointX() + PT_RADIUS, 
                C_HEIGHT - autonMovePoints[index-1].getPointY() + PT_RADIUS, 
                xPos + PT_RADIUS, 
                C_HEIGHT - yPos + PT_RADIUS
            );

            this.backwardEdge = edge;
            autonMovePoints[index-1].forwardEdge = edge; 
        }

        // Movement Callback
        this.fabricGroup.on('moving', () => {
            this.updateEdges();
        });
    }

    getPointX() {
        return this.fabricGroup.left;
    }

    getPointY() {
        return C_HEIGHT - this.fabricGroup.top;
    }

    updateEdges() {
        if(this.forwardEdge) this.forwardEdge.updateInitialPosition(this.fabricGroup.left, this.fabricGroup.top);
        if(this.backwardEdge) this.backwardEdge.updateFinalPosition(this.fabricGroup.left, this.fabricGroup.top);
    }

    setPositionX(x) {
        this.fabricGroup.set({ left: x })
        this.updateEdges();
    }

    setPositionY(y) {
        this.fabricGroup.set({top: C_HEIGHT - y})
        this.updateEdges();
    }
    
}

class autonPathEdge {
    constructor(x1, y1, x2, y2) {
        this.fabricEdge = new fabric.Line([x1, y1, x2, y2], {
            stroke: 'red',
            strokeWidth: 4,
            selectable: false,
        });

        canvas.add(this.fabricEdge);
        canvas.renderAll();
    }

    updateInitialPosition(x, y) {
        this.fabricEdge.set({ x1: x + PT_RADIUS, y1: y + PT_RADIUS });
    }

    updateFinalPosition(x, y) {
        this.fabricEdge.set({ x2: x + PT_RADIUS, y2: y + PT_RADIUS });
    }
}

// Util Functions
const addAutonPoint = (x, y) => {
    //Scaling wierd, gotta add 12 to y
    let point = new autonMovePoint(autonMovePoints.length, scaleInchesToCoords(x), scaleInchesToCoords(y + 12));
    autonMovePoints.push(point);

    originalCoords.push([x, y]);
}


const getAutonPointFromGroup = (group) => {

    for(object of group._objects) {
        if (object instanceof fabric.Text) return autonMovePoints[Number(object.text)];
    }
}

addAutonPoint(108, 12);
addAutonPoint(50, 12);
addAutonPoint(60, 12);

// Field & Robot

const fieldInstance = new fabric.Image(document.getElementById('fieldbg'), {
    selectable: false
});

const robot = new fabric.Image(document.getElementById('robot'), {
    // selectable: false,
    originX: 'center',
    originY: 'center',
    scaleX: 0.2,
    scaleY: 0.2,
    left: autonMovePoints[0].getPointX() + PT_RADIUS,
    top: C_HEIGHT - autonMovePoints[0].getPointY() + PT_RADIUS,
    visible: false
});

canvas.add(fieldInstance);
canvas.add(robot);


// Main Functions

const updateCode = () => {

    let codeString = "";
    
    autonMovePoints.forEach((element, index) => {
        if(index === autonMovePoints.length - 1) return; // skip last
        const currentXInches = scaleCoordsToInches(element.getPointX());
        const currentYInches = scaleCoordsToInches(element.getPointY()) - 12;

        const nextXInches = scaleCoordsToInches(autonMovePoints[index+1].getPointX());
        const nextYInches = scaleCoordsToInches(autonMovePoints[index+1].getPointY()) - 12;

        console.log({ currentXInches, currentYInches, nextXInches, nextYInches })

        codeString += `this->translateRelative(${(nextXInches - currentXInches).toFixed(2)}, ${(nextYInches - currentYInches).toFixed(2)}, 32.5);\n`
    })
    
    $("#codeContent").text(codeString);
    Prism.highlightAll();
}

const main = () => {
    autonMovePoints.forEach(ele => canvas.bringToFront(ele.fabricGroup));
    canvas.sendToBack(fieldInstance);
    canvas.renderAll();

    $("#selectedPoint").text(getAutonPointFromGroup(canvas.getActiveObject()).index);

    updateCode();

    $("#xpos").val(scaleCoordsToInches(canvas.getActiveObject().left));
    $("#ypos").val(scaleCoordsToInches(C_HEIGHT - canvas.getActiveObject().top) - 12);
}

const play = () => {

    // Show bot & set pos
    canvas.bringToFront(robot);
    robot.set({
        left: autonMovePoints[0].getPointX() + PT_RADIUS,
        top: C_HEIGHT - autonMovePoints[0].getPointY() + PT_RADIUS,
        visible: true
    });

    // Anims
    autonMovePoints.forEach((element, index) => {
        setTimeout(() => {
            if(index === autonMovePoints.length - 1) return;
            const robotStartX = robot.left;
            const robotStartY = C_HEIGHT - robot.top;
            const robotStartAngle = robot.angle;
    
            const robotEndX = autonMovePoints[index + 1].getPointX();
            const robotEndY = autonMovePoints[index + 1].getPointY();
    
            const lookAngle = (-1*Math.atan2(robotStartY - robotEndY, robotStartX - robotEndX) * RAD2DEG) - 90;
            robot.animate('angle', lookAngle, { 
                onChange: canvas.renderAll.bind(canvas),
                onComplete: () => {
                    robot.animate('left', robotEndX + PT_RADIUS, { onChange: canvas.renderAll.bind(canvas) });
                    robot.animate('top', C_HEIGHT - robotEndY + PT_RADIUS, { onChange: canvas.renderAll.bind(canvas) });
                }
            });
        }, index * 1000)

    })

}

// Events

$("#addPoint").click(function (e) { 
    addAutonPoint(72, 72);
});

$("#reset").click(function (e) { 
    robot.set({
        left: autonMovePoints[0].getPointX() + PT_RADIUS,
        top: C_HEIGHT - autonMovePoints[0].getPointY() + PT_RADIUS,
        visible: false
    });
    canvas.renderAll();
});

$("#update").click(function (e) { 
    const autonPoint = getAutonPointFromGroup(canvas.getActiveObject());
    autonPoint.setPositionX(scaleInchesToCoords( Number($("#xpos").val()) ));
    autonPoint.setPositionY(scaleInchesToCoords( Number($("#ypos").val()) + 12 ));

    updateCode();

    canvas.renderAll();
});

$("#play").click(play);

$("#copy").click(function (e) { 

    let saveData = "";
    autonMovePoints.forEach(point => {
        saveData += `addAutonPoint(${scaleCoordsToInches(point.getPointX()).toFixed(2)}, ${scaleCoordsToInches(point.getPointY()).toFixed(2) - 12});\n`
    })

    navigator.clipboard.writeText(saveData);
});

canvas.on("selection:created", main);
canvas.on("selection:updated", main);
canvas.on("object:moving", main);

canvas.sendToBack(fieldInstance);
canvas.renderAll();