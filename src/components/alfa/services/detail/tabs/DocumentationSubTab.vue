<template>
  <md-card>
    <div class="doc-nav">
      <div class="sub-item-container" v-if="category">
        <a class="sub-item h1" v-for="itemH1 in category.headers" @click.stop v-scroll-to="{
                                 el: `#${itemH1.id}`,
                                 container: '#documentation-content'
                            }">
          <md-button class="md-icon-button custom-but" v-if="Object.keys(itemH1.sub).length"
                     @click.stop="itemH1.active = !itemH1.active">
            <md-icon v-if="itemH1.active">remove</md-icon>
            <md-icon v-else>add</md-icon>
          </md-button>
          {{itemH1.name}}
          <a class="sub-item h2" v-if="itemH1.active" v-for="itemH2 in itemH1.sub" @click.stop
             v-scroll-to="{
                                     el: `#${itemH2.id}`,
                                     container: '#documentation-content'
                                }">
            <md-button class="md-icon-button custom-but" v-if="Object.keys(itemH2.sub).length"
                       @click.stop="itemH2.active = !itemH2.active">
              <md-icon v-if="itemH2.active">remove</md-icon>
              <md-icon v-else>add</md-icon>
            </md-button>
            {{ itemH2.name }}
            <a class="sub-item h3" v-if="itemH2.active" v-for="itemH3 in itemH2.sub" @click.stop v-scroll-to="{
                                         el: `#${itemH3.id}`,
                                         container: '#documentation-content'
                                    }">
              <md-button class="md-icon-button custom-but" v-if="Object.keys(itemH3.sub).length"
                         @click.stop="itemH3.active = !itemH3.active">
                <md-icon v-if="itemH3.active">remove</md-icon>
                <md-icon v-else>add</md-icon>
              </md-button>
              {{ itemH3.name }}
              <a class="sub-item h4" v-if="itemH3.active" v-for="itemH4 in itemH3.sub" @click.stop v-scroll-to="{
                                             el: `#${itemH4.id}`,
                                             container: '#documentation-content'
                                        }">
                <md-button class="md-icon-button custom-but" v-if="Object.keys(itemH4.sub).length"
                           @click.stop="itemH4.active = !itemH4.active">
                  <md-icon v-if="itemH4.active">remove</md-icon>
                  <md-icon v-else>add</md-icon>
                </md-button>
                {{ itemH4.name }}
                <a class="sub-item h5" v-if="itemH4.active" v-for="itemH5 in itemH4.sub" @click.stop
                   v-scroll-to="{
                                                 el: `#${itemH5.id}`,
                                                 container: '#documentation-content'
                                            }">
                  {{ itemH5.name }}
                </a>
              </a>
            </a>
          </a>
        </a>
      </div>
    </div>
    <div class="documentation-content" id="documentation-content">
      <div v-html="file"></div>
    </div>
  </md-card>
</template>

<script>
  import showdown from 'showdown';
  import vueMarkdown from 'vue-markdown';
  import managedata from '../../../helpers/managedata';

export default {
    name: 'DocumentationSubTab',
    data: () => ({
      file: null,
      category: null
    }),
    components: {
      'vue-markdown': vueMarkdown,
    },
    props: ['algorithm'],
    watch: {
      algorithm(val) {
        this.loadFile(val).then(this.parseHeaders);
      },
    },
    methods: {
      parseHeaders(file, type) {
        const parser = new DOMParser();
        const converter = new showdown.Converter();

        const html = converter.makeHtml(file.body);
        const htmlDocument = parser.parseFromString(html, 'text/html');

        const headersNodes = htmlDocument.querySelectorAll('h1, h2, h3, h4, h5');
        let headers = this.recursiveFunction(null, {}, headersNodes, type, 0);
        return {
          headers,
          file: htmlDocument.body.innerHTML,
        };
      },
      recursiveFunction(lastElement, tree, allNodes, type, index) {
        if (lastElement && (+(allNodes[index].nodeName[1]) <= +(lastElement.el.nodeName[1]))) {
          return this.recursiveFunction(lastElement.parent, tree, allNodes, type, index)
        } else if (allNodes[index]) {
          allNodes[index].id = `${type}-${index}`;
          let tempObj = lastElement ? lastElement.sub : tree;
          let newHeader = {
            name: allNodes[index].innerText,
            id: `${type}-${index}`,
            parent: lastElement,
            sub: {},
            el: allNodes[index],
            active: false,
          };
          tempObj[`${type}-${index}`] = newHeader;
          index++;
          return allNodes[index] ? this.recursiveFunction(newHeader, tree, allNodes, type, index) : tree;
        }
      },
      loadFile(alg) {
        return new Promise((resolve, reject) => {
          /*managedata.getMdFileNS(`algorithms/${alg.algorithmGroupKey}/!*`)
            .then((file) => {
              if (file && file.body) {
                const data = this.parseHeaders(file, 'doc');
                this.category = {
                  title: 'doc',
                  headers: data.headers,
                };
                this.file = data.file;
                resolve(file.body);
              }
            })
            .catch(err => reject(err));*/
        });
      },
    },

};
</script>

<style scoped>
  .md-card {
    width: calc(100% - 40px);
    margin: 10px auto 20px;
    padding: 20px;
    flex-direction: row;
  }
  .h1 {
    margin-left: 0px;
  }

  .h2 {
    margin-left: 10px;
  }

  .h3 {
    margin-left: 20px;
  }

  .h4 {
    margin-left: 30px;
  }

  .h5 {
    margin-left: 40px;
  }

  .fade-enter-active, .fade-leave-active {
    transition: all .5s;
    overflow: hidden;
  }

  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
  {
    height: 0;
    opacity: 0;
  }

  .md-card {
    width: calc(100% - 40px);
    padding: 20px;
    flex-direction: row;
  }

  .doc-nav {
    padding: 10px 0;
    margin-right: 20px;
    padding-right: 20px;
    border-right: 1px solid #000;
    min-width: 300px;
    max-width: 300px;
    height: calc(100vh - 220px);
    overflow-y: auto;
    overflow-x: hidden;
  }

  .doc-nav .item {
    text-transform: uppercase;
    font-size: 14px;
    cursor: pointer;
    background: #0b2152;
    color: #fff;
    padding: 4px;
    text-align: center;
    margin-bottom: 6px;
  }

  /*.doc-nav .item:hover {
    color: ;
  }*/
  .doc-nav .sub-item {
    display: block;
    width: 100%;
    font-size: 12px;
    cursor: pointer;
    position: relative;
    line-height: 20px;
  }

  h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5, .h6 {
    margin-bottom: 0 !important;
  }

  .custom-but {
    position: absolute !important;
    display: inline !important;
    padding: 0 !important;
    margin: 0 !important;
    min-width: auto !important;
    min-height: auto !important;
    width: 20px !important;
    height: 20px !important;
    font-size: 10px !important;
    top: 0;
    left: -23px;
  }

  .custom-but i {
    font-size: 16px !important;
    width: auto !important;
    min-width: auto !important;
    height: auto !important;
    min-height: auto !important;
  }

  .documentation-content {
    height: calc(100vh - 220px);
    overflow: auto;
  }

  .md-theme-default a:not(.md-button) {
    color: #000;
  }

  .md-theme-default code:not(.hljs) {
    background-color: rgba(0, 0, 0, 0.2) !important;
    color: #000 !important;
  }

  .sub-item-container {
    padding-left: 25px;
  }
</style>
