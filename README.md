# 3388A Auton-to-Code-Converter Beta

## Summary 📃
This is team 3388A's autonoumous routine planner web application, that uses a point-to-point interface, inspired by [path.jerryio](https://path.jerryio.com/]), but with direct conversion to code. It also provides a animation system, that allows you to view your path after it is created. 
Featured in our (FUN Interview at Haunted)[https://www.youtube.com/watch?v=Co1_5cfcaEA&t=9s]! And yes, the _first draft_ of the project was made in a day - but we plan to improve this throughout the season!

![image](https://github.com/GauthamV6002/Auton-Planner/assets/77652295/7e60d94d-bd53-498b-b9e0-53fc6e442009)
_Sample Skills Route Created with the PLanner_



## Coming Soon & Known Bugs 🐛

### Known Bugs

| Bug | Predicted Location | Status |
|--|--|--|
| Animation doesn't play correctly  | Turn calculations don't match up with the code calculation | [Unfixed] Future updates will likely solve this by consolidating the calculation system rather than having seperate systems
| Nodes are centered at their top-left corners  | Location is known - `originX` and `originY` need to be set to `"center"`. | [Unfixed] Easy to fix, but requires some reworking in other locations
| Turn calculations result in reflex angles | `math.atan2()` can provide reflex angles in some cases | [Unfixed] Manual calculations required to find the optimal angle, and an option to select the turn direction

### Coming Soon:tm:
- Node Deletion with CRUD functionality
- Variable Code Output System
- Saving/Collaboration with Firebase
- Offline Editing
- Varied Robot Actions & Macros
   - Ramming/outtaking into goal
   - Removing the Match Load
   - Charging Catapults & other mechanisms (via async)
- Curves & Splines?


## Created With 🔧

- HTML, CSS, & JS
- Fabric.js
- Prism.js
