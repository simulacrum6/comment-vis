ABSA was introduced as a SemEval task in 2014 (SE-ABSA14) providing benchmark datasets of English reviews and a common evaluation framework (Pontiki et al., 2014); the datasets were annotated with aspect terms (e.g. “hard disk”, “pizza”) and their polarity for laptop and restaurant reviews, as well as coarser aspect categories (e.g., FOOD) and their polarity only for the restaurants domain. The task was repeated in SemEval 2015 (SE-ABSA15) aiming to facilitate more in-depth research by providing a new ABSA framework in which all the identified constituents of the expressed opinions (aspects, opinion target expressions and sentiment polarities) meet a set of guidelines/specifications and are linked to each other within tuples. In the context of the new framework an aspect category is defined as a combination of an entity type E (e.g. LAPTOP, KEYBOARD, CUSTOMER SUPPORT, RESTAURANT, FOOD) and an attribute type A (e.g. USABILITY, QUALITY, PRICE) of E, making more explicit the difference between entities and the particular facets that are being evaluated (Pontiki et al., 2015). 

 

The SemEval ABSA task for 2016 (SE-ABSA16) gives the opportunity to participants to further experiment with English data (reviews) from the domains of SE-ABSA15 (laptops, restaurants, hotels) by providing new test datasets. In addition, SE-ABSA16 will also provide datasets in other than English languages. For each domain (e.g. restaurants) a common set of annotation guidelines will be used across all languages. Furthermore, SE-ABSA16 includes text-level annotations along with a suitable evaluation methodology.

 


TASK DESCRIPTION

Similarly to the SemEval 2015 ABSA task, the input for the participating systems will consist of whole review texts. Participants will be free to choose the subtasks/languages/domains they wish to participate in.


Subtask 1: Sentence-level ABSA. Given an opinionated document about a target entity (e.g. a laptop, a restaurant or a hotel), the goal is to identify all the opinion tuples with the following types of information:

 

Slot 1: Aspect Category Detection. The task is to identify every entity E and attribute A pair towards which an opinion is expressed in the given text. E and A should be chosen from predefined inventories of entity types (e.g. LAPTOP, MOUSE, RESTAURANT, FOOD) and attribute labels (e.g. DESIGN, PRICE, QUALITY). The E, A inventories for each domain are described in the respective annotation guidelines documents.
Slot 2: Opinion Target Expression (OTE). The task is to extract the OTE, i.e., the linguistic expression used in the given text to refer to the reviewed entity E of each E#A pair. The OTE is defined by its starting and ending offsets. When there is no explicit mention of the entity, the slot takes the value “NULL”. This slot will be required only for particular datasets/domains.
Slot 3: Sentiment Polarity. Each identified E#A, OTE tuple has to be assigned one of the following polarity labels: positive, negative, or neutral (mildly positive or mildly negative sentiment).
The annotations should be assigned at the sentence-level taking also into account the context of the review, since correctly identifying the E, A pairs of a sentence and their polarities often requires examining a wider part or the whole review. Below are two examples of the expected output for a given review from the laptops and the restaurants domains respectively:

 

Review id:LPT1 (Laptop)
S1:The So called laptop Runs to Slow and I hate it! →
{LAPTOP#OPERATION_PERFORMANCE, negative}, {LAPTOP#GENERAL, negative}
S2:Do not buy it! → {LAPTOP#GENERAL, negative}
S3:It is the worst laptop ever. → {LAPTOP#GENERAL, negative}


Review id:RST1 (Restaurant)
S1:I was very disappointed with this restaurant. →
{RESTAURANT#GENERAL, “restaurant”, negative, from="34" to="44"}
S2:I’ve asked a cart attendant for a lotus leaf wrapped rice and she replied back rice and just walked away. →{SERVICE#GENERAL, “cart attendant”, negative, from="12" to="26"}
S3:I had to ask her three times before she finally came back with the dish I’ve requested. →
{SERVICE#GENERAL, “NULL”, negative}
S4:Food was okay, nothing great. →
{FOOD#QUALITY, “Food”, neutral, from="0" to="4"}
S5:Chow fun was dry; pork shu mai was more than usually greasy and had to share a table with loud and rude family. →
{FOOD#QUALITY, “Chow fun”, negative, from="0" to="8"},
{FOOD#QUALITY, “pork shu mai”, negative, from="18" to="30"},
{AMBIENCE#GENERAL, “NULL”, negative}
S6:I/we will never go back to this place again. →
{RESTAURANT#GENERAL, “place”, negative, from="32" to="37"}


Subtask 2: Text-level ABSA. Given a set of customer reviews about a target entity (e.g. a laptop or a restaurant), the goal is to identify a set of {aspect, polarity} tuples that summarize the opinions expressed in each review. For example, for the review text LPT1:


Review id:LPT1 (Laptop)
"The So called laptop Runs to Slow and I hate it! Do not buy it! It is the worst laptop ever."


a system should return the following opinion tuples:


{LAPTOP#OPERATION_PERFORMANCE, negative}
{LAPTOP#GENERAL, negative}


However, this is not a simple summation task given that each aspect may be discussed with different sentiment in several parts of the review. In such cases the dominant sentiment has to be identified. For example, for the restaurant review text RST1:


Review id:RST1 (Restaurant)
"I was very disappointed with this restaurant. I’ve asked a cart attendant for a lotus leaf wrapped rice and she replied back rice and just walked away. I had to ask her three times before she finally came back with the dish I’ve requested. Food was okay, nothing great. Chow fun was dry; pork shu mai was more than usually greasy and had to share a table with loud and rude family. I/we will never go back to this place again."


a system should return the following opinion tuples, since the dominant sentiment about the quality of the food is “negative” and not “neutral”:


{RESTAURANT#GENERAL, negative}
{SERVICE#GENERAL, negative}
{FOOD#QUALITY, negative}
{AMBIENCE#GENERAL, negative}

 

In the case of conflicting opinions where the dominant sentiment is not clear, the “conflict” label should be assigned. For example, in the following review (RST2) the reviewer expresses a positive opinion about one dish (pad seew chicken) and a negative opinion about another one (pad thai) without providing any further information:


Review id: RST2 (Restaurant)
“This little place has a cute interior decor and affordable city prices. The pad seew chicken was delicious, however the pad thai was far too oily. I would just ask for no oil next time.”


{AMBIENCE#GENERAL, positive}
{RESTAURANT#PRICES, positive}
{FOOD#QUALITY, conflict}
{RESTAURANT#GENERAL, positive}

In addition, note that for each review text a system has to assign an overall sentiment label about the target entity (LAPTOP#GENERAL or RESTAURANT#GENERAL) even if it is not explicitly stated.


More examples are provided in the trial data.


Subtask 3: Out-of-domain ABSA. The participating teams will have the opportunity to test their systems in a previously unseen domain for which no training data will be made available. This subtask will be supported for the French language.

 

DATASETS

English. Two domain specific datasets for consumer electronics (laptops) and restaurants, consisting of over 1000 review texts (approx., 6K sentences) with fine-grained human annotations (opinion target expressions, aspect categories and polarities) will be provided for training/development. In particular, the SE-ABSA15 train and test datasets for restaurants and laptops (with sime corrections) will be made available as training data. They consist of 800 review texts (4500 sentences) annotated with approx. 15000 unique label assignments (E, A, OTE, polarity). The laptops dataset consists of 450 review texts (2500 sentences) annotated with 2923 {E#A, polarity} tuples. The restaurants dataset consists of 350 review texts (2000 sentences) annotated with 2499 {E#A, OTE, polarity} tuples. All datasets will be enriched with text-level annotations. New testing data will be generated for all three domains.
Arabic. Datasets for the hotels domain will be provided for training and testing. The Datasets consist of ~3000 review texts (~6000 sentences) that contain manually annotated {E#A, OTE, polarity} tuples.
Chinese. Two domain specific datasets for consumer electronics (mobile phones and digital cameras) will be provided for training and testing. They consist of 400 review texts (~4100 sentences) that contain manually annotated {E#A, polarity} tuples.
Dutch. Two domain specific datasets for restaurants and consumer electronics will be provided for training and testing. The restaurants dataset consists of 400 review texts (2297 sentences) containing 2445 manually annotated {E#A, OTE, polarity} tuples. Details about the consumer electronics dataset will be provided later.
French. Datasets for the restaurants domain will be provided for training and testing. They consist of ~470 review texts (~2500 sentences) that contain manually annotated {E#A, OTE, polarity} tuples.
Russian. Datasets for the restaurants domain will be provided. In particular, the datasets of the SentiRuEval-2015 (Loukachevitch et al, 2015) will be modified to comply with the SE-ABSA16 annotation schema ({E#A, OTE, polarity} tuples). They consist of 300 review texts (4000 sentences). New testing data will be generated.
Spanish. Datasets for the restaurants domain will be provided. More information coming soon...
Turkish. Datasets for the restaurants and telecom domain will be provided. The restaurants dataset will consist of 300 reviews. The telecom dataset will consist of 3000 Tweets related to Turkish telecom companies and services.

Examples of the annotated datasets are provided in the trial data (Data & Tools page).


EVALUATION

The input for the participating systems will be customer review documents from a particular language and domain (i.e. a laptop, a restaurant or a hotel). Each system will be required to extract the information types that are described above at sentence and at the text-level. Similar to SE-ABSA14 and SE-ABSA-15 the evaluation will run in more than one phases; this facilitates the participation of a team in (only) the subtasks/slots that it is interested in. For example, in sentence-level ABSA, in a phase A, raw reviews will be provided and the participants will have to return the {category, OTEs} tuples. Subsequently, in a phase B, the gold (correct) annotations for Phase A will be provided and the corresponding polarities will be required. The output files of the participating systems (of each phase) will be evaluated by comparing them to corresponding files based on the human annotations of the test reviews. The evaluation framework for Subtask 1 will be similar to that of the SE-ABSA15; F1 measure will be used for the evaluation of aspect category detection and opinion target expression extraction, and Accuracy for sentiment polarity classification. Details about the evaluation framework for Subtask 2 will be soon announced.

Similarly to SE-ABSA15, each team may submit two runs:


Constrained: using ONLY the provided training/development data (of the corresponding domain).
Unconstrained: using additional resources, such as lexicons or additional training data. All teams will be asked to report the data and resources they used for each submitted run.


ORGANIZERS

Maria Pontiki (mpontiki@ilsp.gr), Institute for Language and Speech Processing, Athena R.C., Greece. [contact person]

Dimitrios Galanis (galanisd@ilsp.gr), Institute for Language and Speech Processing, Athena R.C., Greece.

Haris Papageorgiou (xaris@ilsp.gr), Institute for Language and Speech Processing, Athena R.C., Greece.

Suresh Manandhar (suresh@cs.york.ac.uk), Department of Computer Science, University of York, UK.

Ion Androutsopoulos (ion@aueb.gr), Department of Informatics, Athens University of Economics and Business, Greece.


Multilingual Datasets are supported by:

Arabic: Jordan University of Science and Technology, Computer Science Department, Irbid, Jordan.

          Mohammad AL-Smadi (maalsmadi9@just.edu.jo) [contact person]
          Mahmoud Al-Ayyoub (maalshbool@just.edu.jo)
          Bashar Talafha (talafha@live.com)
          Omar Qawasmeh (omar_qawasmeh@hotmail.com)


Chinese: Research Center for Social Computing and Information Retrieval, Harbin Institute of Technology, China.

          Yanyan Zhao  (zyyster@gmail.com) [contact person]
          Bing Qin (bqin@ir.hit.edu.cn)
          Duyu Tang (dytang@ir.hit.edu.cn)
          Ting Liu (tliu@ir.hit.edu.cn)


Dutch: Language and Translation Technology Team (LT3), Ghent University, Belgium.

          Orphée De Clercq (orphee.declercq@ugent.be) [contact person]
          Els Lefever (els.lefever@ugent.be)
          Véronique Hoste (veronique.hoste@ugent.be)


French: LIMSI-CNRS, Orsay, France.

          Marianna Apidianaki (marianna@limsi.fr) [contact person]
          Xavier Tannier (xtannier@limsi.fr) [contact person]


Russian: Lomonosov Moscow State University, Russia.

               Vyatka State Humanities University, Kirov, Russia.

          Loukachevitch Natalia (louk_nat@mail.ru) [contact person]

          Kotelnikov Evgeny (kotelnikov.ev@gmail.com)
          Blinov Pavel (blinoff.pavel@gmail.com)

 

Spanish: Institut Universitari de Lingüística Aplicada, Universitat Pompeu Fabra (UPF), Barcelona.

              SINAI, Universidad de Jaén, Spain.

          Núria Bel (nuria.bel@upf.edu) [contact person]

          Salud María Jiménez Zafra (sjzafra@ujaen.es) [contact person]

 

Turkish: Istanbul Technical University, Department of Computer Engineering, Turkey.

               Turkcell Global Bilgi, Turkey.

          Gülşen Eryiğit (gulsen.cebiroglu@itu.edu.tr) [contact person]
          Fatih Samet Çetin (FATIH.CETIN@global-bilgi.com.tr)
          Ezgi Yıldırım (EZGI.YILDIRIM@global-bilgi.com.tr)
          Can Özbey (can.ozbey@global-bilgi.com.tr)
          Tanel Temel (Tanel.Temel@global-bilgi.com.tr)

 

REFERENCES

Maria Pontiki, Dimitrios Galanis, Haris Papageorgiou, Suresh Manandhar, and Ion Androutsopoulos. 2015. Semeval-2015 task 12: Aspect based sentiment analysis. In Proceedings of the 9th International Workshop on Semantic Evaluation (SemEval 2015), Denver, Colorado.


Maria Pontiki, Dimitrios Galanis, John Pavlopoulos, Haris Papageorgiou, Ion Androutsopoulos, and Suresh Manandhar. 2014. Semeval-2014 task 4: Aspect based sentiment analysis. In Proceedings of the 8th International Workshop on Semantic Evaluation (SemEval 2014), pages 27–35, Dublin, Ireland.


John Pavlopoulos. 2014. Aspect based sentiment analysis. PhD thesis, Dept. of Informatics, Athens University of Economics and Business, Greece.


Gayatree Ganu, Noemie Elhadad, and Amelie Marian. 2009. Beyond the stars: Improving rating predictions using review text content. In Proceedings of WebDB, Providence, Rhode Island, USA.


Minqing Hu and Bing Liu. 2004a. Mining and summarizing customer reviews. In Proceedings of KDD, pages 168–177, Seattle, WA, USA.


Minqing Hu and Bing Liu. 2004b. Mining opinion features in customer reviews. In Proceedings of AAAI, pages 755–760, San Jose, California.


Lei Zhang and Bing Liu. 2014. Aspect and Entity Ex-traction for Opinion Mining", book chapter in Data Mining and Knowledge Discovery for Big Data: Methodologies, Challenges, and Opportunities, Springer, 2014.


Richard Socher, Alex Perelygin, Jean Wu, Jason Chuang, Christopher D. Manning, Andrew Y. Ng, and Christopher Potts. 2013b. Recursive deep models for semantic compositionality over a sentiment treebank. In Proceedings of the 2013 Conference on Empirical Methods in Natural Language Processing, pages 1631–1642, Stroudsburg, PA, October. Association for Computational Linguistics.


Julian McAuley, Jure Leskovec, and Dan Jurafsky. 2012. Learning attitudes and attributes from multi-aspect reviews. In Proceedings of the 12th IEEE International Conference on Data Mining, ICDM ’12, pages 1020–1025, Brussels, Belgium.


Abdulla, N. A., Al-Ayyoub, M., & Al-Kabi, M. N. (2014). An extended analytical study of arabic sentiments. International Journal of Big Data Intelligence 1, 1(1-2), 103-113.


Mohammad AL-Smadi, Omar Qawasmeh, Bashar Talafha, & Muhannad Quwaider. Human Annotated Arabic Dataset of Book Reviews for Aspect Based Sentiment Analysis. Proceedings of 3rd International Conference on Future Internet of Things and Cloud (FiCloud 2015), August, 2015, Rome, Italy


Yanyan Zhao, Bing Qin, Ting Liu, "Creating a Fine-Grained Corpus for Chinese Sentiment Analysis", IEEE Intelligent Systems, vol.30, no. 1, pp. 36-43, Jan.-Feb. 2015.


Orphée De Clercq (2015). Tipping the scales. Exploring the added value of deep semantic processing on readability prediction and sentiment analysis. Ghent University. (http://www.lt3.ugent.be/en/publications/tipping-the-scales-exploring-the-added-value-of-deep-semanti/).


Loukachevitch, N., Blinov, P., Kotelnikov, E., Rubtsova Yu, V., Ivanov, V. V., & Tutubalina, E. (2015). SentiRuEval: Testing Object-oriented Sentiment Analysis Systems in Russian. In Proceedings of International Conference Dialog (pp. 3-9).


Blinov, P., & Kotelnikov, E. (2014). Distributed Representations of Words for Aspect-Based Sentiment Analysis at SemEval. In Proceedings of the 8th International Workshop on Semantic Evaluation (SemEval 2014) (pp. 140-144).


Blinov, P. D., & Kotelnikov, E. V. (2014). Using Distributed Representations for Aspect-Based Sentiment Analysis.In Computational Linguistics and Intellectual Technologies: Papers from the Annual International Conference «Dialogue (pp. 68-79).


Chetviorkin, I., & Loukachevitch, N. (2013). Evaluating Sentiment Analysis Systems in Russian. In Proceedings of BSNLP workshop, ACL-2013 (pp. 12-16).


Chetviorkin, I., & Loukachevitch, N. V. (2012). Extraction of Russian Sentiment Lexicon for Product Meta-Domain. In COLING (pp. 593-610).

 

Gülşen Eryiğit, Fatih Samet Çetin, Meltem Yanık, Tanel Temel, İlyas Çiçekli. (2013). TURKSENT: A Sentiment Annotation Tool for Social Media. In Proceedings of the 7th Linguistic Annotation Workshop & Interoperability with Discourse, ACL 2013, Sofia, Bulgaria, 4-9 August 2013.

 

Ezgi Yıldırım, Fatih Samet Çetin, Gülşen Eryiğit, Tanel Temel. (2014). The Impact of NLP on Turkish Sentiment Analysis, in Proceedings of the TURKLANG'14 International Conference on Turkic Language Processing, Istanbul, 06-07 November 2014

 

Gülşen Eryiğit. (2014) ITU Turkish NLP Web Interface. In Proceedings of the Demonstrations at the 14th Conference of the European Chapter of the Association for Computational Linguistics (EACL 2014). Gothenburg, Sweden, April 2014. (http://tools.nlp.itu.edu.tr)

