# Konzept

Das Projekt soll eine Webapp hervorbringen, die es Nutzern erlaubt, Sammlungen von Kommentaren zu einem bestimmten Untersuchungsobjekt visuell zu erkunden und infolgedessen einen besseren Überblick über die Stimmung der Kommentierenden zu unterschiedlichen Facetten des Elements zu erhalten.

## Interaktionsflow

Nutzer landen zunächst auf der _Upload Page_.
Hier können sie ihre eigenen Daten hochladen, oder einen der bereitgestellten Demo Datensätze auswählen.  
Wenn der gewählte Datensatz erfolgreich verarbeitet wurde, werden Nutzer auf die _Stats Page_ weitergeleitet.
Hier werden grundliegende Informationen zum Datensatz geliefert, die ihnen einen Überblick über den Datensatz geben und auf besondere Merkmale hinweisen (z.B. aussergewöhnlich positive / negative Kommentare, siehe _Highlight Reel_).
Von der _Stats Page_ kann der Nutzer zur eigentlichen Visualisierung, der _Exploration Page_.  
Diese Seite ist der Kern der Anwendung und soll es dem Nutzer ermöglichen, eine Kommentarsektion visuell zu explorieren. Hauptaufgabe der _Exploration Page_ ist es, die Aufmerksamkeit der Nutzer schnell auf relevante Elemente der Daten zu lenken und dazu die Visualisierung so anzupassen, dass interessante Merkmale sofort ersichtlich sind.  
Sobald Nutzer einen interessantes Element in seinen Daten gefunden hat, kann er dessen _Detail Page_ aufrufen, um nähere Informationen über das Element zu erhalten.
Informationen, die auf der _Exploration Page_ nicht verfügbar waren, sollen hier ersichtlich sein.  
Nutzer können von der _Detail Page_ entweder auf eine weitere _Detail Page_ gelangen, oder zur _Exploration Page_ zurückkehren, um nach weiteren interessanten Elementen zu suchen.  
Ein direkter vergleich von Elementen ist zu diesem Zeitpunkt nicht vorgesehen.

## Gestaltungs- und Interaktionsprinzipien

Im Folgenden werden Prinzipien festgehalten, die innerhalb der App konsistent gehalten werden sollen, sodass Nutzer eine intuitive Interaktion mit der App erleben können.

### Werte

Nutzer erhalten zu jedem Wert, der ihnen in Zahlen präsentiert wird, die folgenden Erklärungen:

1. Was bedeutet die Zahl?
2. Woraus wird sie berechnet (wenn anwendbar)?

In Tabellen werden diese Informationen über einen Tooltip über die Wertspalte / -zeile bereitgestellt, andernfalls über einen Tooltip direkt am Wert.

Werte in Texten werden visuell hervorgehoben, um zu signalisieren, dass diese vom Datensatz abhängig sind.

***Offene Frage*** Gibt es Fälle, in denen die Werte in einem Datensatz clickbar sein sollen und man auf eine Seite kommt, die Informationen dazu darstellt?

### Navigation

**Context** Nutzer erhalten auf jeder _Page_ am Anfang der Seite Informationen darüber, wo sie sich gerade befinden und was sie sehen.
Diese Kontextinformation ist clickbar, sodass Nutzer auf übergeordnete Seiten zurücknavigieren können.

**No dead ends** Egal auf welcher Seite sich Nutzer befinden, sollte es mindestens ein anderes Element geben zu dessen _Detail Page_ Nutzer navigieren können.

### Elemente

**Sort, Filter, More** Wenn eine Menge von Elementen präsentiert wird, ist diese auf verschiedene Weise anpassbar:
1. Sie kann nach verschiedenen Eigenschaften sortiert werden
2. Sie kann nach bestimmten Merkmalen gefiltert werden. Alternativ können bestimmte Elemente ausgewählt werden, um die Menge zu filtern.
3. Auf dargestellte Elemente der Menge kann per click auf eine Detailseite für dieses Element navigiert werden.

**Peek** Wenn Nutzer über ein Element _hovern_ sollen sie (sofern vorhanden) zusätzliche Informationen über das Element erhalten (_peek_), die in der Visualisierung evtl. abstrahiert wurden.

**Select** Ein _click_ stellt immer eine Selektion (_select_) dar, die signalisiert, dass der Nutzer weiter mit dem Element interagieren möchte.
Die Möglichkeit der Interaktion sollte folgendermaßen visuell kommuniziert werden:
1. Veränderung des Cursors
2. Visuelle Hervorhebung des Elements
3. (Bei Navigation zu anderer _Page_) Tooltip, der den Nutzer über bevorstehende Navigation informiert.

Interkationsmöglichkeiten, die über die oben genannten hinaus gehen (z.B. drag & drop) sollten ebenfalls über einen Tooltip kommuniziert werden.

**Merge & Split** Elemente können über eine _merge_ Aktion zu Elementgruppen kombiniert werden. Elemente können über _split_ Aktionen aus Gruppen gelöst werden.  
Diese Aktionen können in jedem View durchgeführt werden. 

### Layout

**F-Shape Information Relevance** Nutzer betrachten Webseiten in einem F Muster.
D.h. je weiter oben und je weiter Links auf einer Seite ein Element ist, desto eher wird es gelesen.  
Entsprechend sollte die wichtigste Information (idR eine Visualisierung) in der oberen linken Ecke der Seite präsentiert werden.

**Tools on top** Toolbars (z.B. für filtering) befinden sich immmer über den Elementen, auf die sie sich beziehen.

***Offene Frage:*** Wo navigation?

### Farben

**Accept, reject, warn** Für jede Aktionsart wird eine eigene Farbe definiert. 
Die Farbe wird dann benutzt, wenn die jeweiligen Aktionsart bereit steht. 
Die Farben unterscheiden sich von den Sentiment Farben.

**Sentiment** Jedes Sentiment erhält eine Farbe.
Für jede Farbe werden 3 Varianten festgelegt:
1. default (wenn Sentiment kommuniziert wrid)
2. highlight (für Hervorhebungen)
3. border (ggf. für Umrandungen)

Wenn ein Element oder ein Wert Sentiment kommuniziert, wird die zugehörige Farbe benutzt. 
Wenn sich ein Sentiment Wert zwischen den maxima und minima der jeweiligen Kategorie befindet, wird der Farbwert interpoliert entsprechend.

# Implementierung

Im Folgenden werden Implementierungsdetails festgehalten.

## Pages

coming soon...

## Datenformate & Eingabe

Nutzer können ihre eigenen Kommentarsammlungen hochladen oder einen der vorgefertigten Datensätzen wählen.  
Datensätze können drei unterschiedliche Grade an Vorverarbeitung beinhalten:

1. _Keine Vorverarbeitung_ Datensatz enthält nur Kommentare.
2. _Mit Sentiment_ Datensatz enthält Kommentare und Sentiment Informationen.
3. _Volle Vorverarbeitung_ Datensatz enthält Kommentare, Sentiment Informationen und Aspekt-Attribut Tupel.

Beim Upload von eigenen Daten müssen Nutzer das Datenformat angeben. 
Wenn die Daten keine volle Vorverarbeitung beinhalten werden nötige Verarbeitungsschritte (Sentiment Analysis & Aspect-Attribute Extraction) vom Backend übernommen. 

Sentiment kann folgendermaßen angegeben werden:

* _Positive_: 'positive', 1
* _Negative_: 'negative', -1
* _Neutral_: 'neutral', 0
* _Unknown_: 'unknown', '*', *

### Datei Formate

**Plain Text (*.txt)** Einfache Textdatei, in der ein Kommentar pro Zeile angegeben wird.  
```
This is an informative comment. It is great.
And this is a comment of considerable complexity, unfit for any reader. Mountains are made of rock.
```

**Sentiment Comments (*.csv)** Ein Kommentar pro Zeile, Sentiment Information durch Tab separiert. 
Sentiment kann entweder in Zahlen oder Wörtern angegeben werden.
```
This is an informative comment. It is great.    1
And this is a comment of considerable complexity, unfit for any reader. Mountains are made of rock.    -1
```

**Sentiment Opinions (*.csv)** Eine Meinung pro Zeile, mit zugehörigem Kommentar und Sentiment Information, separiert durch Tabs.
```
This is an informative comment.    This is an informative comment. It is great.    1
It is great.    This is an informative comment. It is great.    1
And this is a comment of considerable complexity, unfit for any reader.    And this is a comment of considerable complexity, unfit for any reader. Mountains are made of rock.    -1
Mountains are made of rock.    And this is a comment of considerable complexity, unfit for any reader. Mountains are made of rock.    0
```

**Full JSON (*.ce.json)** Eine Meinung pro Zeile, mit Aspect und Attribute Extraktion und Sentiment.
```json
[
    {
        "comment": "This is an informative comment. It is great.",
        "aspect": { "text": "comment", "group": "comment" },
        "attribute": { "text": "infomative", "group": "information" },
        "sentiment": "positive"
    },
    {
        "comment": "This is an informative comment. It is great.",
        "aspect": { "text": "it", "group": "comment" },
        "attribute": { "text": "great", "group": "quality" },
        "sentiment": "positive"
    },
    {
        "comment": "And this is a comment of considerable complexity, unfit for any reader. Mountains are made of rock.",
        "aspect": { "text": "comment", "group": "comment" },
        "attribute": { "text": "considerable complexity", "group": "complexity" },
        "sentiment": "negative"
    },
    {
        "comment": "And this is a comment of considerable complexity, unfit for any reader. Mountains are made of rock.",
        "aspect": { "text": "Mountains", "group": "mountain" },
        "attribute": { "text": "made of", "group": "make" },
        "sentiment": "neutral"
    },
]
```

# Glossar

***Aspect (Aspekt)*** Teil einer _Opinion_, auf die sich die Aussage in der _Opinion_ bezieht.  
_Wording_: 'Topic'

***Attribute (Attribut)*** Teil einer _Opinion_, die bestimmt... TODO

***Chart*** Visuelle Repräsentation einer oder mehrerer _Opinions_. Bezieht sich ausschließlich auf die Abbildung, nicht auf die zugehörigen interaktiven Elemente der Anwendung.

***Darstellung*** Eine Repräsentation von einer oder mehreren _Opinions_. Kann visuell oder textuell sein.  

***Element*** Teil einer _Darstellung_ von _Opinions_. Kann eine oder mehrere _Opinions_ repräsentieren.   

***Entity (Objekt)*** Die Sache auf die sich die Kommentare im Datensatz beziehen.  

***Facet (Facette)*** Teil einer _Opinion_, entweder _Aspect_ oder _Attribute_.

***Mood (Stimmung)*** Differenz zwischen positiven und negativen _Sentiments_ für ein _Element_.  

***Opinion (Meinung)*** Aussage über die _Entity_ des Datensatzes. Beinhaltet Text, _Aspect_, _Attribute_ und _Sentiment_.  

***Page (Seite)*** Eine Seite der Anwendung.

***Sentiment*** Wertungsrichtung einer _Opinion_. _Positive_, _negative_ oder _neutral_.  

***View*** Komponente einer _Page_, die eine oder mehrere _Darstellungen_ enthält.

***Visualisation (Visualisierung)*** Eine Repräsentation von einer mehreren _Opinions_ in visueller Form. Beinhaltet sowohl die _Chart_, als auch zusätzliche Informationen und interaktive Elemente.
