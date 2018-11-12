
/* First created by JCasGen Mon Nov 12 17:22:46 CET 2018 */
package awkwardrobots.dkpro.types;

import org.apache.uima.cas.Feature;
import org.apache.uima.cas.Type;
import org.apache.uima.cas.impl.FeatureImpl;
import org.apache.uima.cas.impl.TypeImpl;
import org.apache.uima.jcas.JCas;
import org.apache.uima.jcas.JCasRegistry;
import org.apache.uima.jcas.tcas.Annotation_Type;

/**
 * Updated by JCasGen Mon Nov 12 17:22:46 CET 2018
 *
 * @generated
 */
public class Comment_Type extends Annotation_Type {
    /**
     * @generated
     */
    @SuppressWarnings("hiding")
    public final static int typeIndexID = Comment.typeIndexID;
    /**
     * @generated
     * @modifiable
     */
    @SuppressWarnings("hiding")
    public final static boolean featOkTst = JCasRegistry.getFeatOkTst("awkwardrobots.dkpro.types.Comment");

    /**
     * @generated
     */
    final Feature casFeat_sentiment;
    /**
     * @generated
     */
    final int casFeatCode_sentiment;

    /**
     * initialize variables to correspond with Cas Type and Features
     *
     * @param jcas    JCas
     * @param casType Type
     * @generated
     */
    public Comment_Type(JCas jcas, Type casType) {
        super(jcas, casType);
        casImpl.getFSClassRegistry().addGeneratorForType((TypeImpl) this.casType, getFSGenerator());


        casFeat_sentiment = jcas.getRequiredFeatureDE(casType, "sentiment", "uima.cas.String", featOkTst);
        casFeatCode_sentiment = (null == casFeat_sentiment) ? JCas.INVALID_FEATURE_CODE : ((FeatureImpl) casFeat_sentiment).getCode();

    }

    /**
     * @param addr low level Feature Structure reference
     * @return the feature value
     * @generated
     */
    public String getSentiment(int addr) {
        if (featOkTst && casFeat_sentiment == null)
            jcas.throwFeatMissing("sentiment", "awkwardrobots.dkpro.types.Comment");
        return ll_cas.ll_getStringValue(addr, casFeatCode_sentiment);
    }

    /**
     * @param addr low level Feature Structure reference
     * @param v    value to set
     * @generated
     */
    public void setSentiment(int addr, String v) {
        if (featOkTst && casFeat_sentiment == null)
            jcas.throwFeatMissing("sentiment", "awkwardrobots.dkpro.types.Comment");
        ll_cas.ll_setStringValue(addr, casFeatCode_sentiment, v);
    }
}



    