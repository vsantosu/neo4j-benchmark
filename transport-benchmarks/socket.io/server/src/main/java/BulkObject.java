/**
 * Created by victor on 2/24/17.
 */
public class BulkObject {

    private String index;
    private String[][] operations;

    public String[][] getOperations() {
        return operations;
    }

    public void setOperations(String[][] operations) {
        this.operations = operations;
    }

    public String getIndex() {
        return index;
    }

    public void setIndex(String index) {
        this.index = index;
    }
}
