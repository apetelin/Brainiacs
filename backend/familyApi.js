import {family} from "./family.js";

export function getFamilyMember(name){
    var members=family.family
    for(var i in members){
        if(members[i].Name==name){
            return(family[i]);
        }
    }
    return "Not a family member";
}

export function addFamilyMember(addMember){
    var members=family.family
    members.push(addMember)
    return "Member details added Successfully"
}