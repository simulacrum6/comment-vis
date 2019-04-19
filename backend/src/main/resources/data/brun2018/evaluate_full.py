#!/usr/bin/env python3
import sys, os
from io import open
import xml.etree.ElementTree as ET

liste_gold={}
liste_pred={}
liste_gold_alloccurences={}
liste_pred_alloccurences={}

def getScoresPerClass(tpPerClass, fpPerClass, fnPerClass):
    allClasses = set(tpPerClass).union(set(fpPerClass)).union(set(fnPerClass))
    scoresPerClass = {}
    for cl in allClasses:
        tp=0
        fp=0
        fn=0
        if cl in tpPerClass:
            tp = tpPerClass[cl]
        if cl in fnPerClass:
            fn = fnPerClass[cl]
        if cl in fpPerClass:
            fp = fpPerClass[cl]
        scoresPerClass[cl]=getScores(tp, fp, fn, 1)
        #print(cl, scoresPerClass[cl])
    return scoresPerClass

def printScores(allscores):
    scores=allscores[0]
    scoresPerClass=allscores[1]
    scoresLabels = list(scores.keys())
    labels_format ="{:>30}"
    row_format ="{:<10}" * (len(scoresLabels))
    print(labels_format.format(""), row_format.format(*scoresLabels))
    #print("CLASS \t"+"\t".join(scoresLabels))
    #print("--------------------------")
    if scoresPerClass!=None:        
        for cl in scoresPerClass:            
            row =  [scoresPerClass[cl][l] for l in scoresLabels]
            print(labels_format.format(cl+"|"), row_format.format(*row))            
            #print(cl+"\t"+"\t".join())
        print("--------------------------")
    print(labels_format.format("OVERALL |"), row_format.format(*[scores[l] for l in scoresLabels]))            
    

        
def getScores(TP, FP, FN, TOTAL):
    #print("COMMON=",TP)
    #print("FP (predicted but not in gold) =",FP)       
    #print("MISSED =",FN)
    #print("GOLD=",TP+FN)
    #print("PREDICTED=",TP+FP)
    #print("TOTAL=",TOTAL)
    if TP==0 and FP == 0:
        precision = 1    
    else:
        precision = TP / (TP + FP)        
    if TP == 0 and FN == 0:        
        recall = 1        
    else:
        recall =  TP / (TP + FN)
    if precision == 0 and recall == 0:
        F1 = 1
    elif precision*recall == 0:
        F1 = 0
    else:
        F1 = 2*precision*recall/(precision+recall)
     
    accuracy = (TP)/TOTAL
    return dict(zip(["P", "R", "F1", "COMMON", "GOLD", "PREDICTED"],  [round(precision, 4), round(recall, 4), round(F1, 4), TP, TP+FN, TP+FP]))

def getFullAttStr(att):
    return att['category']+";"+att['polarity']+";"+att['target']+";"+att['from']+"-"+att['to']

def getS13AttStr(att):
    return att['category']+";"+att['polarity']

def getTermAttStr(att):
    return att['target']+":"+att['from']+"-"+att['to']

def getTupleAndTripleOccs(f):
    """
    reads dataset in semeval format, and stores different information required for evaluation task:
        - aspects, 
        - aspect/offset pairs
        - aspect/polarity pairs
        - aspect/offset/polarity triples        
    """
    e = ET.parse(f)
    root = e.getroot()
    aspects = {}
    terms = {}
    tuples = {}
    triples = {}    
    for child in root:
        #print(child.tag, child.attrib)
        sentid=""
        s = 0
        for c2 in child:
            for c3 in c2:                         
                if not "OutOfScope" in c3.attrib:
                    sentid=c3.attrib['id']
                    s+=1
                    if not sentid in tuples:
                        aspects[sentid] = set([])
                        tuples[sentid]=set([])
                        triples[sentid]=set([])
                        terms[sentid]=set([])
                    for c4 in c3:
                      #  print(c4.tag, c4.attrib)
                        for c5 in c4:
                            #print("Opinion=",  str(c5.attrib))
                            if "category" in c5.attrib:
                                aspects[sentid].add(c5.attrib['category'])                        
                                if 'polarity' in c5.attrib:
                                    triples[sentid].add(getFullAttStr(c5.attrib))
                                    tuples[sentid].add(getS13AttStr(c5.attrib))
                                    #label=(c5.attrib['category'], c5.attrib['polarity'])
                            #print(sentid, getTermAttStr(c5.attrib))
                            if 'target' in c5.attrib:
                                if c5.attrib['target'].strip() not in ["NULL", ""]:                  
                                    terms[sentid].add(getTermAttStr(c5.attrib))
                                                                
    return aspects, terms, tuples, triples


def computeScores(liste_pred, liste_gold, perClass):
    #print(liste_pred)
    FNperclass={}
    TNperclass={}
    TPperclass={}
    FPperclass={}
    nbclassesingold={}
    nbclassesinpred={}
    allclasses={}
    TP=0
    FP=0
    FN=0
    TN=0
    TOTAL = 0    
    nbref=0
    macro_p = 0
    macro_r = 0
    acc = 0
    predicted = 0
    
    for c in  liste_gold.keys():
        #print(c, liste_pred[c], liste_gold[c])        
        if c in liste_pred:           
            tpl = liste_pred[c].intersection(liste_gold[c])
            fpl = liste_pred[c].difference(liste_gold[c])
            fnl = liste_gold[c].difference(liste_pred[c])
            total=len(liste_pred[c].union(liste_gold[c]))    
            
            #if len(tpl)>0:
            #    print("MATCH", c, tpl)
            
        else:
            tpl = set()
            fpl = set()
            fnl = liste_gold[c]
            total =len(liste_gold[c])
        #print("MISSED", c, fnl)
#        GOLD +=len(liste_gold[c])
        TOTAL +=total
        if total>0:
            acc +=len(tpl)/total
        else:
            acc +=1
        if perClass:
            for x in tpl:
                if not x in TPperclass:
                    TPperclass[x] = 0
                TPperclass[x]+=1
            for x in fnl:
                if not x in FNperclass:
                    FNperclass[x] = 0
                FNperclass[x]+=1
            for x in fpl:
                if not x in FPperclass:
                    FPperclass[x] = 0
                FPperclass[x]+=1
            
            
        tp=len(tpl)
        fp = len(fpl)
        fn=len(fnl)
        r =0 
        p = 0
        if  tp == 0 and fp == 0:
            p = 1
        elif tp==0 and fn ==0:
            r = 1
        else:
            p=tp/(tp+fp)
            r = tp/(tp+fn)
        macro_r+=r
        macro_p +=p
        #print(c, tp, fn, fp )
        TP += tp
        FP += fp
        FN += fn
        #TN += 36-len(liste_pred[c].union(liste_gold[c]))

    macro_r = macro_r/len(liste_gold.keys())
    macro_p = macro_p/len(liste_gold.keys())
    macro_f1 = 2*macro_r*macro_p/(macro_r+macro_p)
    #print("macroF1=", macro_f1)
    #print("AVG ACC", acc/len(liste_gold.keys()))
    if perClass:
        return getScores(TP, FP, FN, TOTAL), getScoresPerClass(TPperclass, FPperclass, FNperclass)
    else:
        return getScores(TP, FP, FN, TOTAL), None
        
            
import argparse
argparser = argparse.ArgumentParser(description='Full chain evaluation of semeval 2016 datasets')
    
argparser.add_argument('-prd', '--prediction', type=str,
                       help='Pathname to the file with predictions')

argparser.add_argument('-gld', '--gold', type=str,
                       help='Pathname to the file with gold annotations')
argparser.add_argument('-s1', '--slot1', action="store_true",
                       help=' perform evaluation for slot 1 (aspect detection)')

argparser.add_argument('-s2', '--slot2', action="store_true",
                       help=' perform evaluation for slot 2 (opinionated term extraction)')

argparser.add_argument('-s3', '--slot3', action="store_true",
                       help=' perform evaluation for slot 3 (polarity classification) WARNING : when using this option, make sure you perform polarity predictions on gold term/aspect annotations. The result will be equivalent to s123 evaluation.')

argparser.add_argument('-s13', '--slot13', action="store_true",
                       help=' perform evaluation for slot 1,3 (aspect,polarity)')
argparser.add_argument('-s12', '--slot12', action="store_true",
                       help=' perform evaluation for slot 1,2 (OTE, aspect)')

argparser.add_argument('-s123', '--slot123', action="store_true",
                       help=' perform evaluation for slot 1,2,3 (OTE,aspect,polarity)')

argparser.add_argument('-pc', '--perclass', action="store_true",
                       help=' output evaluation per class ')

args = argparser.parse_args()
    
def main():
    
    pred_s1, pred_s2, pred_s12, pred_s123 = getTupleAndTripleOccs(args.prediction)            
    gold_s1, gold_s2, gold_s12, gold_s123= getTupleAndTripleOccs(args.gold)            
    
    
    if args.slot1:
        print("ASPECT CATEGORY scores"), printScores(computeScores(pred_s1, gold_s1, args.perclass))
    if args.slot2:
        print("OTE scores"), printScores(computeScores(pred_s2, gold_s2, args.perclass))
    if args.slot3:
        print("POLARITY scores"), printScores(computeScores(pred_s123, gold_s123, args.perclass))
    if args.slot13:
        print("<ASPECT, POLARTY> scores"), printScores(computeScores(pred_s12, gold_s12, args.perclass))
    
    if args.slot123:
        print("<OTE, ASPECT, POLARITY> scores"), printScores(computeScores(pred_s123, gold_s123, args.perclass))
        
               
if __name__ == '__main__':
    main() 
    
