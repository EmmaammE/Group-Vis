// 以免后面后端接口的名字变化或者要在别的地方使用，就定义一下

// [ [topicId, topicName] ]
export const TOPICS = "all_topics";
// 人物降维的位置 {person_id: [x,y]}
export const POSITIONS = "person_id2position2d";
export const LABEL_2_TOPIC = "label2topic_ids";
// 字典
export const DICT = "nodes_edges_dict"
export const TOPIC_SENTENCE_POSITION = "topic_id2sentence_id2position1d";
export const TOPIC_PMI = "topic_pmi"