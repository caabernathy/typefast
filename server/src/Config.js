/**
 * Copyright (c) 2016-present, Facebook, Inc. All rights reserved.
 *
 * You are hereby granted a non-exclusive, worldwide, royalty-free license to
 * use, copy, modify, and distribute this software in source code or binary
 * form for use in connection with the web services and APIs provided by
 * Facebook.
 *
 * As with any software that integrates with the Facebook platform, your use
 * of this software is subject to the Facebook Developer Principles and
 * Policies [http://developers.facebook.com/policy/]. This copyright notice
 * shall be included in all copies or substantial portions of the software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * @flow
 */

const assert = require('assert');
const fs = require('fs');
const {List, Map} = require('immutable');

const READ_FILE_OPTS = {
  encoding: 'UTF-8',
  flag: 'r'
};

class Config {

  sources: List<string>;
  data: Map<string, any>;

  static fromArgv(argv: List): Config {
    // FIXME actually get the list from argv
    return new Config(new List([
      __dirname + '/../config/default.json',
      __dirname + '/../config/local.json',
    ]));
  }

  constructor(sources: List<string>): void {
    this.sources = sources;
    let data = new Map();
    sources.filter(this.fileExists.bind(this))
      .map(this.readJson.bind(this))
      .forEach(part => data = data.mergeDeep(part));
    this.data = data;
  }

  fileExists(filepath: string): bool {
    try {
      fs.accessSync(filepath, fs.R_OK);
      return true;
    } catch (e) {}
    return false;
  }

  readJson(filepath: string): Object {
    return JSON.parse(fs.readFileSync(filepath, READ_FILE_OPTS));
  }

  getSources(): List<string> {
    return this.sources;
  }

  getData(): Map<string, any> {
    return this.data;
  }

  resolveSubtree(subtree: string): any {
    return this.data.getIn(subtree.split('.'), undefined);
  }

  getAny(subtree: string): any {
    return this.resolveSubtree(subtree);
  }

  getNumber(subtree: string): number {
    const leaf = this.resolveSubtree(subtree);
    assert(Number.isFinite(leaf));
    return leaf;
  }

  getInteger(subtree: string): number {
    const leaf = this.resolveSubtree(subtree);
    assert(Number.isInteger(leaf));
    return leaf;
  }

  getString(subtree: string): string {
    const leaf = this.resolveSubtree(subtree);
    assert(typeof leaf === 'string');
    return leaf;
  }
}

module.exports = Config;