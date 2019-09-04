import {uuid} from "d3plus-common";

import {isValidCut, isValidGrouping} from "./validation";

class Grouping {
  constructor(level, members) {
    /**
     * A unique id for the grouping element
     * @type {string}
     */
    this.uuid = uuid();

    /**
     * A mondrian-rest-client Level instance
     * @type {import("mondrian-rest-client").Level}
     */
    this.level = level;

    /**
     * A mondrian-rest-client Member list for the current level
     * @type {import("mondrian-rest-client").Member[]}
     */
    this.members = members || [];
  }

  get key() {
    return this.level && this.level.annotations._key;
  }

  get name() {
    return this.level && this.level.name;
  }

  get hasMembers() {
    return this.members.length > 0;
  }

  toString() {
    return (
      this.level &&
      `${this.key}${
        this.hasMembers
          ? `-${this.members.map(member => member.key).join("~")}`
          : ""
      }`
    );
  }

  serialize() {
    const fullName = this.level.fullName;
    const string = this.members.map(m => `${fullName}.&[${m.key}]`).join(",");
    return string.indexOf("],[") > -1 ? `{${string}}` : string;
  }

  getClone() {
    const clone = new Grouping(this.level, this.members);
    clone.uuid = this.uuid;
    return clone;
  }

  setLevel(level) {
    if (this.level !== level) {
      const clone = this.getClone();
      clone.level = level;
      clone.members = [];
      return clone;
    }
    return this;
  }

  addMember(member) {
    const index = this.members.findIndex(obj => obj.key === member.key);
    if (index > -1) {
      return this;
    }
    const clone = this.getClone();
    const members = clone.members.slice();
    members.push(member);
    members.sort((a, b) => `${a.key}`.localeCompare(`${b.key}`));
    clone.members = members;
    return clone;
  }

  clearMembers() {
    const clone = this.getClone();
    clone.members = [];
    return clone;
  }

  removeMember(member, index) {
    if (index == null) {
      index = this.members.findIndex(obj => obj.key === member.key);
    }
    if (index === -1) {
      return this;
    }
    const clone = this.getClone();
    const members = clone.members.slice();
    members.splice(index, 1);
    clone.members = members;
    return clone;
  }
}

Grouping.isValid = isValidGrouping;
Grouping.isValidCut = isValidCut;

export default Grouping;