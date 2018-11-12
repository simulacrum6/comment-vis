

/* First created by JCasGen Mon Nov 12 17:22:46 CET 2018 */
package awkwardrobots.dkpro.types;

import org.apache.uima.jcas.JCas;
import org.apache.uima.jcas.JCasRegistry;
import org.apache.uima.jcas.cas.TOP_Type;
import org.apache.uima.jcas.tcas.Annotation;


/**
 * Updated by JCasGen Mon Nov 12 17:22:46 CET 2018
 * XML source: C:/Users/Nev/Projects/_Uni/comment-aspects/researchproject/src/main/resources/desc/types/Comment.xml
 *
 * @generated
 */
public class Comment extends Annotation {
    /**
     * @generated
     * @ordered
     */
    @SuppressWarnings("hiding")
    public final static int typeIndexID = JCasRegistry.register(Comment.class);
    /**
     * @generated
     * @ordered
     */
    @SuppressWarnings("hiding")
    public final static int type = typeIndexID;

    /**
     * Never called.  Disable default constructor
     *
     * @generated
     */
    protected Comment() {/* intentionally empty block */}

    /**
     * Internal - constructor used by generator
     *
     * @param addr low level Feature Structure reference
     * @param type the type of this Feature Structure
     * @generated
     */
    public Comment(int addr, TOP_Type type) {
        super(addr, type);
        readObject();
    }

    /**
     * @param jcas JCas to which this Feature Structure belongs
     * @generated
     */
    public Comment(JCas jcas) {
        super(jcas);
        readObject();
    }

    /**
     * @param jcas  JCas to which this Feature Structure belongs
     * @param begin offset to the begin spot in the SofA
     * @param end   offset to the end spot in the SofA
     * @generated
     */
    public Comment(JCas jcas, int begin, int end) {
        super(jcas);
        setBegin(begin);
        setEnd(end);
        readObject();
    }

    /**
     * @return index of the type
     * @generated
     */
    @Override
    public int getTypeIndexID() {
        return typeIndexID;
    }

    /**
     * <!-- begin-user-doc -->
     * Write your own initialization here
     * <!-- end-user-doc -->
     *
     * @generated modifiable
     */
    private void readObject() {/*default - does nothing empty block */}


    //*--------------*
    //* Feature: sentiment

    /**
     * getter for sentiment - gets
     *
     * @return value of the feature
     * @generated
     */
    public String getSentiment() {
        if (Comment_Type.featOkTst && ((Comment_Type) jcasType).casFeat_sentiment == null)
            jcasType.jcas.throwFeatMissing("sentiment", "awkwardrobots.dkpro.types.Comment");
        return jcasType.ll_cas.ll_getStringValue(addr, ((Comment_Type) jcasType).casFeatCode_sentiment);
    }

    /**
     * setter for sentiment - sets
     *
     * @param v value to set into the feature
     * @generated
     */
    public void setSentiment(String v) {
        if (Comment_Type.featOkTst && ((Comment_Type) jcasType).casFeat_sentiment == null)
            jcasType.jcas.throwFeatMissing("sentiment", "awkwardrobots.dkpro.types.Comment");
        jcasType.ll_cas.ll_setStringValue(addr, ((Comment_Type) jcasType).casFeatCode_sentiment, v);
    }
}

    